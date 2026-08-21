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
  Eye,
  Video,
  Cloud,
  CloudUpload,
  FolderUp,
  ChevronDown,
  CheckCircle2,
  Calendar,
  Compass,
  History,
  Link2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { SmartPlace, GalleryPhoto, PageRoute, SavedTrip } from '../types';
import { loadSmartPlaces, saveSmartPlaces, processImageFile } from '../utils/galleryStorage';
import { TravelShowcaseCarousel } from '../components/TravelShowcaseCarousel';
import { useAuth } from '../context/AuthContext';
import { fetchUserTripsFromSupabase } from '../utils/tripStorage';
import {
  isGoogleDriveConnected,
  getGoogleDriveCredentials,
  uploadToGoogleDrive,
  hasGoogleDriveApiKey,
  initiateGoogleDriveAuth,
} from '../utils/googleDrive';

interface SmartGalleryPageProps {
  onNavigate: (page: PageRoute) => void;
}

interface UploadingFile {
  localId: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  previewUrl?: string;
}

export const SmartGalleryPage: React.FC<SmartGalleryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [places, setPlaces] = useState<SmartPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userTrips, setUserTrips] = useState<SavedTrip[]>([]);
  const [tripsLoaded, setTripsLoaded] = useState(false);

  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [placeNameInput, setPlaceNameInput] = useState('');
  const [placeNoteInput, setPlaceNoteInput] = useState('');
  const [editingPlace, setEditingPlace] = useState<SmartPlace | null>(null);
  const [placeToDelete, setPlaceToDelete] = useState<SmartPlace | null>(null);
  const [selectedTripForPlace, setSelectedTripForPlace] = useState<string | null>(null);
  const [showTripDropdown, setShowTripDropdown] = useState(false);

  const [editingNoteForPlace, setEditingNoteForPlace] = useState<SmartPlace | null>(null);
  const [noteDraftText, setNoteDraftText] = useState('');

  const [activePhoto, setActivePhoto] = useState<{ photo: GalleryPhoto; placeId: string } | null>(null);

  const [uploadingForPlaceId, setUploadingForPlaceId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadQueue, setUploadQueue] = useState<UploadingFile[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetPlace, setUploadTargetPlace] = useState<SmartPlace | null>(null);

  const [gdriveConnected, setGdriveConnected] = useState(false);
  const [useCloudUpload, setUseCloudUpload] = useState(true);

  useEffect(() => {
    const check = () => setGdriveConnected(isGoogleDriveConnected());
    check();
    const interval = setInterval(check, 2000);
    window.addEventListener('storage', check);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', check);
    };
  }, []);

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

  useEffect(() => {
    if (!user?.uid || tripsLoaded) return;
    let active = true;
    fetchUserTripsFromSupabase(user.uid)
      .then((trips) => {
        if (active) {
          setUserTrips(trips);
          setTripsLoaded(true);
        }
      })
      .catch((err) => {
        console.warn('Could not load trips for gallery:', err);
        if (active) setTripsLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [user?.uid, tripsLoaded]);

  const updatePlaces = (newPlaces: SmartPlace[]) => {
    setPlaces(newPlaces);
    saveSmartPlaces(newPlaces);
  };

  const handleOpenCreatePlaceModal = () => {
    setEditingPlace(null);
    setPlaceNameInput('');
    setPlaceNoteInput('');
    setSelectedTripForPlace(null);
    setShowAddPlaceModal(true);
  };

  const handleOpenEditPlaceModal = (place: SmartPlace) => {
    setEditingPlace(place);
    setPlaceNameInput(place.name);
    setPlaceNoteInput(place.note || '');
    setSelectedTripForPlace(place.linkedTripId || null);
    setShowAddPlaceModal(true);
  };

  const handleSavePlace = (e: React.FormEvent) => {
    e.preventDefault();
    const name = placeNameInput.trim();
    if (!name) return;

    const linkedTrip = selectedTripForPlace
      ? userTrips.find((t) => t.id === selectedTripForPlace)
      : null;

    if (editingPlace) {
      const updated = places.map((p) =>
        p.id === editingPlace.id
          ? {
              ...p,
              name,
              note: placeNoteInput.trim() || undefined,
              linkedTripId: linkedTrip?.id,
              linkedTripName: linkedTrip?.customName,
            }
          : p
      );
      updatePlaces(updated);
    } else {
      const newPlace: SmartPlace = {
        id: `place-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        note: placeNoteInput.trim() || undefined,
        photos: [],
        createdAt: new Date().toISOString(),
        linkedTripId: linkedTrip?.id,
        linkedTripName: linkedTrip?.customName,
      };
      updatePlaces([newPlace, ...places]);
    }

    setShowAddPlaceModal(false);
    setEditingPlace(null);
    setPlaceNameInput('');
    setPlaceNoteInput('');
    setSelectedTripForPlace(null);
  };

  const confirmDeletePlace = () => {
    if (!placeToDelete) return;
    const updated = places.filter((p) => p.id !== placeToDelete.id);
    updatePlaces(updated);
    setPlaceToDelete(null);
  };

  const handleOpenUploadForPlace = (place: SmartPlace) => {
    setUploadTargetPlace(place);
    setUploadQueue([]);
    setShowUploadModal(true);
    setUseCloudUpload(gdriveConnected);
  };

  const handleTriggerFilePick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleAddFilesToQueue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: UploadingFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) continue;

      let previewUrl: string | undefined;
      if (isImage) {
        try {
          previewUrl = URL.createObjectURL(file);
        } catch {}
      }

      newItems.push({
        localId: `up-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        file,
        progress: 0,
        status: 'pending',
        previewUrl,
      });
    }

    if (newItems.length > 0) {
      setUploadQueue((q) => [...q, ...newItems]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFromQueue = (localId: string) => {
    setUploadQueue((q) => {
      const item = q.find((x) => x.localId === localId);
      if (item?.previewUrl) {
        try { URL.revokeObjectURL(item.previewUrl); } catch {}
      }
      return q.filter((x) => x.localId !== localId);
    });
  };

  const processUploads = async () => {
    if (!uploadTargetPlace) return;

    const place = uploadTargetPlace;
    const tripName = place.linkedTripName || place.name;
    const tripId = place.linkedTripId;

    const shouldUseCloud = useCloudUpload && gdriveConnected;

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      if (item.status === 'done') continue;

      setUploadQueue((q) =>
        q.map((x) =>
          x.localId === item.localId ? { ...x, status: 'uploading', progress: 0 } : x
        )
      );

      try {
        const file = item.file;
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (shouldUseCloud) {
          let localThumbUrl: string | undefined;
          let localFileName: string = file.name;
          if (isImage) {
            try {
              setUploadQueue((q) =>
                q.map((x) =>
                  x.localId === item.localId ? { ...x, status: 'processing', progress: 8 } : x
                )
              );
              const processed = await processImageFile(file);
              localThumbUrl = processed.url;
              localFileName = processed.fileName;
            } catch {
              localThumbUrl = item.previewUrl;
            }
          } else if (isVideo) {
            try {
              setUploadQueue((q) =>
                q.map((x) =>
                  x.localId === item.localId ? { ...x, status: 'processing', progress: 8 } : x
                )
              );
              localThumbUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
              });
            } catch {
              localThumbUrl = undefined;
            }
          }

          setUploadQueue((q) =>
            q.map((x) =>
              x.localId === item.localId ? { ...x, status: 'uploading', progress: 15 } : x
            )
          );

          const gdriveResult = await uploadToGoogleDrive(
            file,
            tripName,
            tripId,
            (percent) => {
              const mapped = Math.round(15 + percent * 0.85);
              setUploadQueue((q) =>
                q.map((x) =>
                  x.localId === item.localId ? { ...x, progress: mapped } : x
                )
              );
            }
          );

          const displayUrl = localThumbUrl
            ? localThumbUrl
            : isVideo && gdriveResult.webContentLink
              ? gdriveResult.webContentLink
              : gdriveResult.webViewLink;

          const newPhoto: GalleryPhoto = {
            id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            url: displayUrl,
            dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            fileName: localFileName,
            type: isImage ? 'image' : 'video',
            googleDriveFileId: gdriveResult.fileId,
            googleDriveWebViewLink: gdriveResult.webViewLink,
          };

          setPlaces((prev) => {
            const updated = prev.map((p) =>
              p.id === place.id ? { ...p, photos: [...p.photos, newPhoto] } : p
            );
            saveSmartPlaces(updated);
            return updated;
          });

          setUploadQueue((q) =>
            q.map((x) =>
              x.localId === item.localId ? { ...x, status: 'done', progress: 100 } : x
            )
          );
        } else {
          setUploadQueue((q) =>
            q.map((x) =>
              x.localId === item.localId ? { ...x, status: 'processing', progress: 30 } : x
            )
          );

          if (isImage) {
            const { url, fileName } = await processImageFile(file);
            const newPhoto: GalleryPhoto = {
              id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              url,
              dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
              fileName,
              type: 'image',
            };
            setPlaces((prev) => {
              const updated = prev.map((p) =>
                p.id === place.id ? { ...p, photos: [...p.photos, newPhoto] } : p
              );
              saveSmartPlaces(updated);
              return updated;
            });
          } else {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });
            const newPhoto: GalleryPhoto = {
              id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              url: dataUrl,
              dateAdded: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
              fileName: file.name,
              type: 'video',
            };
            setPlaces((prev) => {
              const updated = prev.map((p) =>
                p.id === place.id ? { ...p, photos: [...p.photos, newPhoto] } : p
              );
              saveSmartPlaces(updated);
              return updated;
            });
          }

          setUploadQueue((q) =>
            q.map((x) =>
              x.localId === item.localId ? { ...x, status: 'done', progress: 100 } : x
            )
          );
        }
      } catch (err: any) {
        console.warn('Upload failed for', item.file.name, err);
        setUploadQueue((q) =>
          q.map((x) =>
            x.localId === item.localId
              ? { ...x, status: 'error', errorMessage: err?.message || 'Upload failed' }
              : x
          )
        );
      }
    }
  };

  const closeUploadModal = () => {
    uploadQueue.forEach((item) => {
      if (item.previewUrl) {
        try { URL.revokeObjectURL(item.previewUrl); } catch {}
      }
    });
    setShowUploadModal(false);
    setUploadQueue([]);
    setUploadTargetPlace(null);
  };

  const handleTriggerUpload = (placeId: string) => {
    setUploadingForPlaceId(placeId);
    const place = places.find((p) => p.id === placeId);
    if (place) {
      handleOpenUploadForPlace(place);
    }
    setUploadingForPlaceId(null);
  };

  const handleFileSelectionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    handleAddFilesToQueue(e);
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

  const pendingCount = uploadQueue.filter((x) => x.status === 'pending').length;
  const completedCount = uploadQueue.filter((x) => x.status === 'done').length;
  const hasPendingOrUploading = uploadQueue.some(
    (x) => x.status === 'pending' || x.status === 'uploading' || x.status === 'processing'
  );

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-peaceful-bg-pattern text-[#202422] pb-24 selection:bg-[#183B32] selection:text-[#FAF7F2]">
      
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        ref={fileInputRef}
        onChange={handleFileSelectionChange}
        className="hidden"
      />

      {/* UPLOAD MODAL */}
      {showUploadModal && uploadTargetPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF7F2] rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto">
            
            <div className="p-6 bg-[#FFFFFF] border-b border-[#EAE3D6]">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FolderUp className="w-5 h-5 text-[#183B32]" />
                    <h3 className="font-serif font-bold text-xl text-[#183B32]">
                      Upload to {uploadTargetPlace.name}
                    </h3>
                  </div>
                  {uploadTargetPlace.linkedTripName && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#57605B] pl-7">
                      <Link2 className="w-3 h-3 text-[#C8963E]" />
                      <span>Linked to trip: <strong>{uploadTargetPlace.linkedTripName}</strong></span>
                    </div>
                  )}
                  <p className="text-[11px] text-[#57605B] pl-7">
                    Select photos and videos. Accepted formats: JPG, PNG, GIF, MP4, WebM, MOV.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="p-1.5 rounded-lg text-[#8C938E] hover:text-[#183B32] hover:bg-[#EFE9DE] cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-[#FAF7F2]">
              
              {/* Cloud toggle */}
              <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#EAE3D6] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${gdriveConnected ? 'bg-[#4285F4]/10 text-[#4285F4]' : 'bg-[#EFE9DE] text-[#8C938E]'}`}>
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#183B32]">Upload to Google Drive</p>
                      <p className="text-[10px] text-[#57605B]">
                        {gdriveConnected ? 'Files stored in Drive with trip folder organization' : 'Connect Drive for unlimited cloud storage'}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useCloudUpload && gdriveConnected}
                      onChange={(e) => setUseCloudUpload(e.target.checked)}
                      disabled={!gdriveConnected}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 rounded-full transition-colors peer peer-checked:bg-[#4285F4] ${gdriveConnected ? 'bg-[#E2DACB]' : 'bg-[#E2DACB]/50'}`}>
                      <div className={`w-5 h-5 rounded-full bg-[#FFFFFF] shadow absolute top-0.5 left-0.5 transition-transform ${useCloudUpload && gdriveConnected ? 'translate-x-5' : ''}`} />
                    </div>
                  </label>
                </div>
                {!gdriveConnected && (
                  <div className="pt-3 border-t border-[#F0EBE0] flex items-center justify-between gap-3">
                    <p className="text-[11px] text-[#C8963E] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Google Drive not connected. Files will be saved locally only.
                    </p>
                    {hasGoogleDriveApiKey() && (
                      <button
                        type="button"
                        onClick={initiateGoogleDriveAuth}
                        className="px-3 py-1.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-[#FFFFFF] text-[11px] font-bold cursor-pointer shrink-0"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Drop zone / add files button */}
              <div
                onClick={handleTriggerFilePick}
                className="border-2 border-dashed border-[#E2DACB] rounded-2xl p-8 sm:p-10 bg-[#FFFFFF] hover:bg-[#FAF7F2] hover:border-[#183B32]/30 transition-all cursor-pointer text-center space-y-3 group"
              >
                <div className="w-14 h-14 rounded-full bg-[#183B32]/8 text-[#183B32] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#183B32]">
                    Click to choose files
                  </p>
                  <p className="text-[11px] text-[#57605B] mt-1">
                    or drag & drop. Photos and videos both supported.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTriggerFilePick(); }}
                  className="px-5 py-2 rounded-xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#E0B466]" />
                  <span>Select Photos & Videos</span>
                </button>
              </div>

              {/* Upload queue */}
              {uploadQueue.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#183B32] uppercase tracking-wider">
                      Upload Queue ({uploadQueue.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => uploadQueue.forEach((i) => removeFromQueue(i.localId))}
                      className="text-[11px] text-[#D96E37] font-bold hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                    {uploadQueue.map((item) => {
                      const isImage = item.file.type.startsWith('image/');
                      const isVideo = item.file.type.startsWith('video/');
                      return (
                        <div
                          key={item.localId}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#EAE3D6]"
                        >
                          <div className="w-12 h-12 rounded-lg bg-[#EFE9DE] shrink-0 overflow-hidden flex items-center justify-center">
                            {item.previewUrl && isImage ? (
                              <img
                                src={item.previewUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : isVideo ? (
                              <Video className="w-5 h-5 text-[#8C938E]" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-[#8C938E]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-[11px] font-semibold text-[#183B32] truncate">
                              {item.file.name}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-[#8C938E]">
                              <span>{formatBytes(item.file.size)}</span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                {isImage ? <ImageIcon className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                                {isImage ? 'Image' : 'Video'}
                              </span>
                              {item.status === 'done' && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-[#2E7D32]">
                                    <CheckCircle2 className="w-3 h-3" /> Done
                                  </span>
                                </>
                              )}
                              {item.status === 'error' && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600">
                                    {item.errorMessage || 'Error'}
                                  </span>
                                </>
                              )}
                              {useCloudUpload && gdriveConnected && (item.status === 'uploading' || item.status === 'processing' || item.status === 'done') && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 text-[#4285F4]">
                                    <CloudUpload className="w-3 h-3" />
                                    Drive
                                  </span>
                                </>
                              )}
                            </div>
                            {(item.status === 'uploading' || item.status === 'processing') && (
                              <div className="h-1.5 bg-[#EFE9DE] rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${useCloudUpload && gdriveConnected ? 'bg-[#4285F4]' : 'bg-[#183B32]'}`}
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                          {item.status !== 'uploading' && item.status !== 'processing' && (
                            <button
                              type="button"
                              onClick={() => removeFromQueue(item.localId)}
                              className="p-1.5 rounded-lg text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] cursor-pointer shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-[#FFFFFF] border-t border-[#EAE3D6] flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#57605B]">
                {uploadQueue.length === 0 ? (
                  <span>No files selected</span>
                ) : completedCount === uploadQueue.length ? (
                  <span className="inline-flex items-center gap-1 text-[#2E7D32] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All {completedCount} files uploaded
                  </span>
                ) : (
                  <span>{pendingCount} pending • {completedCount} of {uploadQueue.length} done</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#57605B] hover:bg-[#EFE9DE] transition-colors cursor-pointer"
                >
                  {completedCount > 0 ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={processUploads}
                  disabled={uploadQueue.length === 0 || !hasPendingOrUploading || (useCloudUpload && !gdriveConnected && useCloudUpload)}
                  className="px-5 py-2 rounded-xl bg-[#183B32] hover:bg-[#245246] disabled:opacity-40 disabled:cursor-not-allowed text-[#FAF7F2] text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  {useCloudUpload && gdriveConnected ? (
                    <>
                      <CloudUpload className="w-3.5 h-3.5 text-[#E0B466]" />
                      <span>Upload to Drive</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-[#E0B466]" />
                      <span>Save {uploadQueue.length > 1 ? 'Files' : 'File'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PLACE */}
      {showAddPlaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF7F2] p-6 sm:p-8 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-md w-full space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#183B32]" />
                <h3 className="font-serif font-bold text-xl text-[#183B32]">
                  {editingPlace ? 'Edit Album' : '+ Create Album'}
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
                  Album Name *
                </label>
                <input
                  type="text"
                  value={placeNameInput}
                  onChange={(e) => setPlaceNameInput(e.target.value)}
                  placeholder="e.g. Goa Beach Trip, Ladakh Adventure..."
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-xs text-[#202422] focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[10px]">
                  Link to Trip <span className="text-[#8C938E] font-normal">(Optional)</span>
                </label>
                {userTrips.length > 0 ? (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setShowTripDropdown(!showTripDropdown)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FFFFFF] border border-[#E2DACB] text-left text-xs focus:outline-none focus:ring-2 focus:ring-[#183B32]/30 flex items-center justify-between gap-2"
                    >
                      {selectedTripForPlace ? (
                        <span className="font-semibold text-[#183B32] truncate">
                          {userTrips.find((t) => t.id === selectedTripForPlace)?.customName}
                        </span>
                      ) : (
                        <span className="text-[#8C938E]">Select a trip from your history...</span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-[#8C938E] shrink-0 transition-transform ${showTripDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showTripDropdown && (
                      <div className="absolute z-10 left-0 right-0 mt-2 rounded-2xl bg-[#FFFFFF] border border-[#E5DFD3] shadow-lg max-h-56 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTripForPlace(null);
                            setPlaceNameInput(placeNameInput || '');
                            setShowTripDropdown(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[11px] text-[#57605B] hover:bg-[#FAF7F2] flex items-center gap-2"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Don't link to any trip</span>
                        </button>
                        <div className="h-px bg-[#F0EBE0] mx-3" />
                        {userTrips.map((trip) => (
                          <button
                            key={trip.id}
                            type="button"
                            onClick={() => {
                              setSelectedTripForPlace(trip.id);
                              if (!placeNameInput.trim() || editingPlace === null) {
                                setPlaceNameInput(trip.customName);
                              }
                              setShowTripDropdown(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-[11px] hover:bg-[#FAF7F2] space-y-1 border-l-2 ${selectedTripForPlace === trip.id ? 'border-[#183B32] bg-[#F0F7F4]' : 'border-transparent'}`}
                          >
                            <div className="font-bold text-[#183B32] flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-[#C8963E]" />
                              {trip.customName}
                            </div>
                            <div className="text-[10px] text-[#57605B] flex items-center gap-2 pl-5">
                              <MapPin className="w-3 h-3" />
                              {trip.startLocation} → {trip.destination}
                              <span className="text-[#8C938E]">•</span>
                              <Calendar className="w-3 h-3" />
                              {trip.days} Days
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-[#FFF9EE] border border-[#F2DEB0] text-[11px] text-[#C8963E] flex items-start gap-2">
                    <History className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">No trips yet.</p>
                      <p className="text-[10px] text-[#8C938E] mt-0.5">
                        Plan a trip first to link albums to your travel history.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-[#183B32] uppercase tracking-wider text-[10px]">
                  Album Note <span className="text-[#8C938E] font-normal">(Optional)</span>
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
                  {editingPlace ? 'Save Changes' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SMALL NOTE */}
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

      {/* MODAL: CONFIRM DELETE PLACE */}
      {placeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E5DFD3] shadow-xl max-w-sm w-full space-y-4">
            <div className="flex items-center gap-3 text-[#D96E37]">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-serif font-bold text-lg text-[#183B32]">Delete Album?</h3>
            </div>
            <p className="text-xs text-[#57605B] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#183B32]">{placeToDelete.name}</strong> and all its {placeToDelete.photos.length} photos/videos?
              {placeToDelete.linkedTripName && (
                <> <br /><span className="text-[11px]">This will not delete the linked trip "{placeToDelete.linkedTripName}".</span></>
              )}
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

      {/* MODAL: PHOTO FULL-SCREEN VIEWER */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B32]/90 backdrop-blur-md animate-fade-in">
          <div className="bg-[#FAF7F2] rounded-3xl border border-[#E5DFD3] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 px-6 border-b border-[#EAE3D6] flex items-center justify-between bg-[#FFFFFF]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-[#183B32]">
                  {activePhoto.photo.type === 'video' ? 'Video Preview' : 'Photo Preview'}
                </span>
                {activePhoto.photo.fileName && (
                  <span className="text-[10px] text-[#8C938E] truncate max-w-[200px]">
                    {activePhoto.photo.fileName}
                  </span>
                )}
                {activePhoto.photo.googleDriveWebViewLink && (
                  <a
                    href={activePhoto.photo.googleDriveWebViewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#4285F4]/10 text-[#4285F4] text-[10px] font-bold hover:bg-[#4285F4]/20 cursor-pointer"
                  >
                    <Cloud className="w-3 h-3" />
                    <span>Open in Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(activePhoto.placeId, activePhoto.photo.id)}
                  className="p-2 rounded-xl text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                  title="Delete"
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
              {activePhoto.photo.type === 'video' ? (
                <video
                  src={activePhoto.photo.url}
                  controls
                  className="max-h-[65vh] max-w-full rounded-xl shadow-md"
                />
              ) : (
                <img
                  src={activePhoto.photo.url}
                  alt="Travel memory"
                  className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-md"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
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
                Save your travel memories organized by album. Link albums to your trips and upload directly to Google Drive.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {gdriveConnected && (
                <div className="px-3.5 py-2 rounded-xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-[11px] font-semibold text-[#4285F4] inline-flex items-center gap-1.5 justify-center">
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Drive Connected</span>
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenCreatePlaceModal}
                className="px-6 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md flex items-center gap-2 transition-all hover:scale-103 active:scale-97 cursor-pointer justify-center"
              >
                <Plus className="w-4 h-4 text-[#E0B466]" />
                <span>+ New Album</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PLACES LIST / CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        <TravelShowcaseCarousel
          variant="banner"
          heightClass="h-[220px] sm:h-[280px]"
          autoPlayInterval={5000}
          overlayGradient="dark"
        />
        
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-[#183B32]/20 border-t-[#183B32] rounded-full" />
            <p className="text-xs text-[#57605B] mt-3">Loading your gallery...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-20 px-6 bg-[#FFFFFF] rounded-3xl border border-dashed border-[#E2DACB] space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#183B32]/10 text-[#183B32] flex items-center justify-center mx-auto">
              <Camera className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-xl text-[#183B32]">
                Your Smart Gallery is empty.
              </h3>
              <p className="text-xs sm:text-sm text-[#57605B]">
                Create your first photo album to start saving beautiful travel moments.
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleOpenCreatePlaceModal}
                className="px-8 py-3.5 rounded-2xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-103"
              >
                <Plus className="w-4 h-4 text-[#E0B466]" />
                <span>+ Create First Album</span>
              </button>
              {gdriveConnected && (
                <p className="text-[11px] text-[#4285F4] font-semibold inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Google Drive is ready — uploads auto-sync to the cloud
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {places.map((place) => {
              const imageCount = place.photos.filter((p) => p.type !== 'video').length;
              const videoCount = place.photos.filter((p) => p.type === 'video').length;
              const cloudCount = place.photos.filter((p) => p.googleDriveFileId).length;
              return (
                <div
                  key={place.id}
                  className="bg-[#FFFFFF] rounded-3xl border border-[#E5DFD3] shadow-xs p-6 sm:p-8 space-y-6 transition-all"
                >
                  {/* PLACE HEADER */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#F0EBE0]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#183B32]/10 text-[#183B32] flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h2 className="font-serif font-bold text-2xl text-[#183B32] flex items-center gap-2 flex-wrap">
                          <span>📍 {place.name}</span>
                        </h2>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8C938E] font-medium">
                          {imageCount > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {imageCount} Photo{imageCount === 1 ? '' : 's'}
                            </span>
                          )}
                          {videoCount > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              {videoCount} Video{videoCount === 1 ? '' : 's'}
                            </span>
                          )}
                          {place.linkedTripName && (
                            <>
                              <span className="text-[#EAE3D6]">|</span>
                              <span className="inline-flex items-center gap-1 text-[#C8963E]">
                                <Link2 className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{place.linkedTripName}</span>
                              </span>
                            </>
                          )}
                          {cloudCount > 0 && (
                            <>
                              <span className="text-[#EAE3D6]">|</span>
                              <span className="inline-flex items-center gap-1 text-[#4285F4]">
                                <Cloud className="w-3 h-3" />
                                {cloudCount} in Drive
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleTriggerUpload(place.id)}
                        className="px-4 py-2.5 rounded-xl bg-[#183B32] hover:bg-[#245246] text-[#FAF7F2] text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                      >
                        {gdriveConnected ? (
                          <CloudUpload className="w-4 h-4 text-[#E0B466]" />
                        ) : (
                          <Camera className="w-4 h-4 text-[#E0B466]" />
                        )}
                        <span>+ Add Photos & Videos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditPlaceModal(place)}
                        className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-[#57605B] hover:text-[#183B32] transition-colors cursor-pointer"
                        title="Edit Album"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlaceToDelete(place)}
                        className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E2DACB] text-[#8C938E] hover:text-[#D96E37] hover:bg-[#FBEBE5] transition-colors cursor-pointer"
                        title="Delete Album"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PHOTO PREVIEWS / GRID */}
                  {place.photos.length === 0 ? (
                    <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#E2DACB] space-y-2">
                      <ImageIcon className="w-7 h-7 text-[#8C938E] mx-auto stroke-[1.5]" />
                      <p className="text-xs text-[#8C938E]">
                        No photos or videos added for {place.name} yet.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleTriggerUpload(place.id)}
                        className="text-xs font-bold text-[#183B32] hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Click here to add photos & videos</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {place.photos.map((photo) => {
                        const isVideo = photo.type === 'video';
                        return (
                          <div
                            key={photo.id}
                            onClick={() => setActivePhoto({ photo, placeId: place.id })}
                            className="group relative aspect-square rounded-2xl overflow-hidden bg-[#EFE9DE] border border-[#EAE3D6] cursor-pointer shadow-2xs hover:shadow-md transition-all"
                          >
                            {isVideo ? (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#202422] to-[#183B32]">
                                <video
                                  src={photo.url}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  preload="metadata"
                                  poster=""
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2]/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    <Video className="w-5 h-5 text-[#183B32] ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={photo.url}
                                alt="Place travel photo"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            )}

                            <div className="absolute top-1.5 left-1.5 flex gap-1">
                              {isVideo && (
                                <span className="px-1.5 py-0.5 rounded-md bg-black/60 text-[#FAF7F2] text-[9px] font-bold flex items-center gap-0.5">
                                  <Video className="w-2.5 h-2.5" />
                                  Video
                                </span>
                              )}
                              {photo.googleDriveFileId && (
                                <span className="px-1.5 py-0.5 rounded-md bg-[#4285F4]/90 text-[#FAF7F2] text-[9px] font-bold flex items-center gap-0.5">
                                  <Cloud className="w-2.5 h-2.5" />
                                  Drive
                                </span>
                              )}
                            </div>

                            <div className="absolute inset-0 bg-[#183B32]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="p-1.5 rounded-lg bg-[#FAF7F2]/90 text-[#183B32]">
                                <Eye className="w-4 h-4" />
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeletePhoto(place.id, photo.id, e)}
                                className="p-1.5 rounded-lg bg-[#FAF7F2]/90 text-[#D96E37] hover:bg-[#D96E37] hover:text-[#FAF7F2] transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {photo.googleDriveWebViewLink && (
                                <a
                                  href={photo.googleDriveWebViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded-lg bg-[#FAF7F2]/90 text-[#4285F4] hover:bg-[#4285F4] hover:text-[#FAF7F2] transition-colors"
                                  title="Open in Google Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* SMALL NOTE SECTION */}
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
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
