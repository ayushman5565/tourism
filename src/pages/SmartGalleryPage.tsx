import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  FileText, 
  Upload, 
  Image as ImageIcon, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { SmartPlace, GalleryPhoto, PageRoute } from '../types';
import { loadSmartPlaces, saveSmartPlaces, processImageFile } from '../utils/galleryStorage';

interface SmartGalleryPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const SmartGalleryPage: React.FC<SmartGalleryPageProps> = ({ onNavigate }) => {
  // State: All Places
  const [places, setPlaces] = useState<SmartPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Active Edit States
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [placeNameInput, setPlaceNameInput] = useState('');
  const [placeNoteInput, setPlaceNoteInput] = useState('');
  const [editingPlace, setEditingPlace] = useState<SmartPlace | null>(null);
  const [placeToDelete, setPlaceToDelete] = useState<SmartPlace | null>(null);

  // Note Editing State
  const [editingNoteForPlace, setEditingNoteForPlace] = useState<SmartPlace | null>(null);
  const [noteDraftText, setNoteDraftText] = useState('');

  // Active Photo Viewer / Lightbox
  const [activePhoto, setActivePhoto] = useState<{ photo: GalleryPhoto; placeId: string } | null>(null);

  // Photo Upload State
  const [uploadingForPlaceId, setUploadingForPlaceId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load from Persistent Storage
  useEffect(() => {
    let isMounted = true;
    loadSmartPlaces().then((loaded) => {
      if (isMounted) {
        setPlaces(loaded);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Save Helper
  const updatePlaces = (newPlaces: SmartPlace[]) => {
    setPlaces(newPlaces);
    saveSmartPlaces(newPlaces);
  };

  // ==========================================
  // PLACE HANDLERS
  // ==========================================
  const handleOpenCreatePlaceModal = () => {
    setEditingPlace(null);
    setPlaceNameInput('');
    setPlaceNoteInput('');
    setShowAddPlaceModal(true);
  };

  const handleOpenEditPlaceModal = (place: SmartPlace) => {
    setEditingPlace(place);
    setPlaceNameInput(place.name);
    setPlaceNoteInput(place.note || '');
    setShowAddPlaceModal(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    const name = placeNameInput.trim();
    if (!name) return;

    if (editingPlace) {
      // Edit Existing Place
      const updated = places.map((p) =>
        p.id === editingPlace.id
          ? {
              ...p,
              name,
              note: placeNoteInput.trim() || undefined,
            }
          : p
      );
      updatePlaces(updated);
    } else {
      // Create New Place
      const newPlace: SmartPlace = {
        id: `place-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        note: placeNoteInput.trim() || undefined,
        photos: [],
        createdAt: new Date().toISOString(),
      };
      updatePlaces([newPlace, ...places]);
    }

    setShowAddPlaceModal(false);
    setEditingPlace(null);
    setPlaceNameInput('');
    setPlaceNoteInput('');
  };

  const confirmDeletePlace = () => {
    if (!placeToDelete) return;
    const updated = places.filter((p) => p.id !== placeToDelete.id);
    updatePlaces(updated);
    setPlaceToDelete(null);
  };

  // ==========================================
  // PHOTO UPLOAD HANDLERS
  // ==========================================
  const handleTriggerUpload = (placeId: string) => {
    setUploadingForPlaceId(placeId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelectionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !uploadingForPlaceId) return;

    const newPhotos: GalleryPhoto[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const { url, fileName } = await processImageFile(file);
        newPhotos.push({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
          url,
          fileName,
          dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        });
      } catch (err) {
        console.warn('Photo processing failed:', err);
      }
    }

    if (newPhotos.length > 0) {
      const updated = places.map((p) => {
        if (p.id === uploadingForPlaceId) {
          return {
            ...p,
            photos: [...p.photos, ...newPhotos], // Append without removing existing photos
          };
        }
        return p;
      });
      updatePlaces(updated);
    }

    setUploadingForPlaceId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeletePhoto = (placeId: string, photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = places.map((p) => {
      if (p.id === placeId) {
        return {
          ...p,
          photos: p.photos.filter((photo) => photo.id !== photoId),
        };
      }
      return p;
    });
    updatePlaces(updated);
    if (activePhoto?.photo.id === photoId) {
      setActivePhoto(null);
    }
  };

  // ==========================================
  // NOTE HANDLERS
  // ==========================================
  const handleOpenEditNote = (place: SmartPlace) => {
    setEditingNoteForPlace(place);
    setNoteDraftText(place.note || '');
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteForPlace) return;

    const trimmed = noteDraftText.trim();
    const updated = places.map((p) =>
      p.id === editingNoteForPlace.id
        ? { ...p, note: trimmed || undefined }
        : p
    );
    updatePlaces(updated);
    setEditingNoteForPlace(null);
    setNoteDraftText('');
  };

  const handleDeleteNote = (placeId: string) => {
    const updated = places.map((p) =>
      p.id === placeId ? { ...p, note: undefined } : p
    );
    updatePlaces(updated);
  };

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24 selection:bg-[#183B32] selection:text-[#FAF7F2]">
      
      {/* Hidden explicit file picker input */}
      <input
        type="file"
        multiple
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileSelectionChange}
        className="hidden"
      />

      {/* 1. MODAL: ADD / EDIT PLACE */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#183B32]" />
                <h3 className="font-serif font-bold text-xl text-[#183B32]">
                  {editingPlace ? 'Edit Place' : 'Add Place'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPlaceModal(false)}
                className="p-1 rounded-lg text-[#8C938E] hover:text-[#183B32] hover:bg-[#EFE9DE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[10px]">
                  Place Name *
                </label>
                <input
                  type="text"
                  value={placeNameInput}
                  onChange={(e) => setPlaceNameInput(e.target.value)}
                  placeholder="e.g. Nahan, Solan, Shimla, Manali..."
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[10px]">
                  Small Note <span className="text-[#8C938E] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={placeNoteInput}
                  onChange={(e) => setPlaceNoteInput(e.target.value)}
                  placeholder="e.g. Beautiful mountain views and a peaceful stop."
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setShowAddPlaceModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#57605B] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!placeNameInput.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#183B32] disabled:opacity-40 text-[#FAF7F2] text-xs font-bold hover:bg-[#245246] transition-colors shadow-sm cursor-pointer"
                >
                  {editingPlace ? 'Save Changes' : 'Create Place'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: EDIT SMALL NOTE */}
      {editingNoteForPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#183B32]" />
                <h3 className="font-serif font-bold text-xl text-[#183B32]">
                  Note for {editingNoteForPlace.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingNoteForPlace(null)}
                className="p-1 rounded-lg text-[#8C938E] hover:text-[#183B32] hover:bg-[#EFE9DE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[10px]">
                  Small Note
                </label>
                <textarea
                  rows={3}
                  value={noteDraftText}
                  onChange={(e) => setNoteDraftText(e.target.value)}
                  placeholder="e.g. Beautiful mountain views and a peaceful stop."
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-[#EAE3D6]">
                <button
                  type="button"
                  onClick={() => setEditingNoteForPlace(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#57605B] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#183B32] text-[#FAF7F2] text-xs font-bold hover:bg-[#245246] transition-colors shadow-sm cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: CONFIRM DELETE PLACE */}
      {placeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-[#D96E37]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-lg text-[#183B32]">Delete Place?</h3>
            </div>
            <p className="text-xs text-[#57605B] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#183B32]">{placeToDelete.name}</strong> and all its {placeToDelete.photos.length} photos?
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setPlaceToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57605B] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlace}
                className="px-4 py-2 rounded-xl bg-[#D96E37] text-[#FAF7F2] text-xs font-bold hover:bg-[#BF5C28] transition-colors shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: PHOTO FULL-SCREEN VIEWER */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#FAF7F2] rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-[#EAE3D6] flex items-center justify-between bg-[#FFFFFF]">
              <span className="text-xs font-bold text-[#183B32]">
                Photo Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(activePhoto.placeId, activePhoto.photo.id)}
                  className="p-2 rounded-xl text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhoto(null)}
                  className="p-2 rounded-xl text-[#8C938E] hover:text-[#183B32] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-[#10221D] flex items-center justify-center p-4 overflow-hidden min-h-[300px]">
              <img
                src={activePhoto.photo.url}
                alt="Travel memory"
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* HEADER SECTION */}
      {/* ========================================== */}
      <div className="bg-[#FAF7F2] border-b border-[#EAE3D6] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold text-[#C8963E]">
                Travel Memories
              </span>
              <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#183B32] mt-1 mb-1 flex items-center gap-2.5">
                <Camera className="w-8 h-8 text-[#183B32]" />
                <span>Smart Gallery</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#57605B] max-w-lg leading-relaxed">
                Save your travel memories organized by place.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={handleOpenCreatePlaceModal}
                className="px-6 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-103 active:scale-97 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#E0B466]" />
                <span>+ Add Place</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* PLACES LIST / CONTENT */}
      {/* ========================================== */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {places.length === 0 ? (
          // 7. EMPTY STATE
          <div className="text-center py-20 px-6 bg-[#FFFFFF] rounded-3xl border border-dashed border-[#E2DACB] space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#183B32]/10 text-[#183B32] flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-[#183B32]">
                Your Smart Gallery is empty.
              </h3>
              <p className="text-xs sm:text-sm text-[#57605B]">
                Save your favourite travel moments here.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenCreatePlaceModal}
              className="px-8 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-103"
            >
              <Plus className="w-4 h-4 text-[#E0B466]" />
              <span>+ Add Place</span>
            </button>
          </div>
        ) : (
          // SIMPLE PLACE CARDS LIST
          <div className="space-y-8">
            {places.map((place) => (
              <div
                key={place.id}
                className="bg-[#FFFFFF] rounded-3xl border border-[#E5DFD3] shadow-xs p-6 sm:p-8 space-y-6 transition-all"
              >
                {/* 1. PLACE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EBE0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#183B32]/10 text-[#183B32] flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif font-bold text-2xl text-[#183B32]">
                        📍 {place.name}
                      </h2>
                      <span className="text-xs text-[#8C938E] font-medium">
                        {place.photos.length} Photo{place.photos.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {/* Add Photos Button */}
                    <button
                      type="button"
                      onClick={() => handleTriggerUpload(place.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                    >
                      <Camera className="w-4 h-4 text-[#E0B466]" />
                      <span>+ Add Photos</span>
                    </button>

                    {/* Edit Place Name */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlaceModal(place)}
                      className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-[#57605B] hover:text-[#183B32] transition-colors cursor-pointer"
                      title="Edit Place Name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Place */}
                    <button
                      type="button"
                      onClick={() => setPlaceToDelete(place)}
                      className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                      title="Delete Place"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 2. PHOTO PREVIEWS / GRID */}
                {place.photos.length === 0 ? (
                  <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E2DACB] space-y-2">
                    <ImageIcon className="w-7 h-7 text-[#8C938E] mx-auto stroke-[1.5]" />
                    <p className="text-xs text-[#8C938E]">
                      No photos added for {place.name} yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTriggerUpload(place.id)}
                      className="text-xs font-bold text-[#183B32] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Click here to add photos</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {place.photos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setActivePhoto({ photo, placeId: place.id })}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-[#EFE9DE] border border-[#EAE3D6] cursor-pointer shadow-2xs hover:shadow-md transition-all"
                      >
                        <img
                          src={photo.url}
                          alt="Place travel photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        <div className="absolute inset-0 bg-[#183B32]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#FAF7F2]/90 text-[#183B32]">
                            <Eye className="w-4 h-4" />
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleDeletePhoto(place.id, photo.id, e)}
                            className="p-1.5 rounded-lg bg-[#FAF7F2]/90 text-[#D96E37] hover:bg-[#D96E37] hover:text-[#FAF7F2] transition-colors"
                            title="Delete photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. SMALL NOTE SECTION */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-[#8C938E] uppercase tracking-wider block">
                      Small Note
                    </span>
                    {place.note ? (
                      <p className="text-xs text-[#202422] font-medium italic leading-relaxed">
                        “{place.note}”
                      </p>
                    ) : (
                      <p className="text-xs text-[#8C938E] italic">
                        No note added yet.
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditNote(place)}
                      className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E2DACB] text-[11px] font-bold text-[#183B32] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                    >
                      {place.note ? 'Edit Note' : '+ Add Note'}
                    </button>
                    {place.note && (
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(place.id)}
                        className="p-1.5 rounded-lg text-[#8C938E] hover:text-[#D96E37] transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
