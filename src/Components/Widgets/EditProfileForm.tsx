import React, { useRef, useState, FormEvent, useEffect } from "react";
import api from "../../api";
import { UserProfile } from "../../contexts/types";
import { z } from "zod";
import ImageCropModal from "../ImageCropModal";
import { RiCameraAiLine } from "react-icons/ri";
import { X } from "react-feather";

const editProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Please insert your Name." })
    .min(3, { message: "Your Name is too short." }),
  bio: z
    .string()
    .max(500, { message: "Bio cannot exceed 500 characters." })
    .optional(),
  is_private: z.boolean(),
});

const nameSchema = editProfileSchema.shape.name;
const bioSchema = editProfileSchema.shape.bio;

interface EditProfileFormProps {
  initialData: UserProfile;
  onClose: () => void;
  onSave: (updated: UserProfile) => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData.name);
  const [bio, setBio] = useState(initialData.bio || "");
  const [isPrivate, setIsPrivate] = useState(initialData.is_private);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | undefined>(
    undefined
  );
  const [tempCoverSrc, setTempCoverSrc] = useState<string | null>(null);
  const [showCoverCrop, setShowCoverCrop] = useState(false);
  const [removedCover, setRemovedCover] = useState(false);

  const [profileFile, setProfileFile] = useState<File | Blob | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [showCrop, setShowCrop] = useState(false);

  //  handler‐e de selectare
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // poți face crop‐ui aici (eventual cu aspect diferit)
    const url = URL.createObjectURL(file);
    setTempCoverSrc(url);
    setShowCoverCrop(true);
  };
  const onCoverCropped = async (blob: Blob) => {
    const file = new File([blob], `cover_${Date.now()}.jpg`, {
      type: blob.type,
    });
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setShowCoverCrop(false);
    if (tempCoverSrc) URL.revokeObjectURL(tempCoverSrc);
    setTempCoverSrc(null);
  };

  // la selectarea fișierului
  const handleProfileFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setTempImageSrc(url);
    setShowCrop(true);
  };

  // La Apply din crop modal
  const onProfileCropped = (blob: Blob) => {
    // dăm un nume fișierului — poți face ceva dinamic, gen folosind timestamp
    const file = new File([blob], `profile_${Date.now()}.jpg`, {
      type: blob.type,
    });
    const url = URL.createObjectURL(file);
    setProfileFile(file);
    setProfilePreview(url);
    setShowCrop(false);
    if (tempImageSrc) URL.revokeObjectURL(tempImageSrc);
    setTempImageSrc(null);
  };

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    bio?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    // validează doar name
    const result = nameSchema.safeParse(newName.trim());
    setFieldErrors((prev) => ({
      ...prev,
      name: result.success ? undefined : result.error.errors[0].message,
    }));
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newBio = e.target.value;
    setBio(newBio);

    // validează doar bio
    const result = bioSchema.safeParse(newBio);
    setFieldErrors((prev) => ({
      ...prev,
      bio: result.success ? undefined : result.error.errors[0].message,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    //  dacă a trecut validarea, trimitem la backend
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("is_private", String(isPrivate));
    if (removedCover) {
      // <== signal “delete the cover on the server”
      formData.append("cover_image", "");
    } else if (coverFile) {
      formData.append("cover_image", coverFile);
    }
    if (profileFile) formData.append("profile_image", profileFile);
    for (const [k, v] of formData.entries()) console.log(k, v);
    try {
      setSubmitting(true);
      const res = await api.patch(`profile/${initialData.username}/`, formData);
      onSave(res.data as UserProfile);
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      // poți afișa aici o eroare globală dacă vrei
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      coverPreview && URL.revokeObjectURL(coverPreview);
      profilePreview && URL.revokeObjectURL(profilePreview);
    };
  }, [coverPreview, profilePreview]);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-white/50">
        <div className="bg-black rounded-xl w-full max-w-2xl overflow-auto shadow-xl">
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <h2 className="text-xl text-white">Edit Profile</h2>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-1 text-white rounded-full"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
          {/* BODY: cover, avatar, form */}
          <div className="p-4 space-y-4">
            {/* cover image cu icon „camera” */}
            <div
              className={`relative h-60 rounded-lg overflow-hidden 
                ${
                  removedCover || !(coverPreview || initialData.cover_image)
                    ? "bg-black"
                    : ""
                }`}
            >
              {!removedCover && (coverPreview ?? initialData.cover_image) && (
                <>
                  <img
                    src={coverPreview ?? initialData.cover_image ?? undefined}
                    className="object-cover w-full h-full"
                    alt="Cover"
                  />
                  <button
                    type="button"
                    title="Remove photo"
                    className="absolute top-25 right-2"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(undefined); // vezi mai jos
                      setRemovedCover(true);
                    }}
                  >
                    <X size={20} color="white" />
                  </button>
                </>
              )}
              <button
                type="button"
                title="Add photo"
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-2 right-2 
              w-20 h-20 
              bg-
              rounded-lg
              flex items-center justify-center
              hover:bg-opacity-75
              transition
              "
              >
                <RiCameraAiLine className="w-5 h-5 text-white/85" />
              </button>

              {/* input-ul real, ascuns */}
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                onChange={handleCoverSelect}
                className="hidden"
              />
            </div>
            {/* avatar */}
            <div className="relative w-40 h-40 -mt-20 ml-4 rounded-full border-4 border-black overflow-hidden">
              <img
                src={profilePreview ?? initialData.profile_image}
                className="object-cover w-full h-full rounded-full"
              />
              <button
                type="button"
                title="Add photo"
                onClick={() => profileInputRef.current?.click()}
                className="absolute top-17 right-17.5 w-11 h-11 
              flex items-center justify-center
              bg-black bg-opacity-50 rounded-full"
              >
                <RiCameraAiLine className=" text-white/85" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={profileInputRef}
                onChange={handleProfileFileSelect}
                className="hidden"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="edit-profile-form">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
            />
            {fieldErrors.name && (
              <p style={{ color: "red", marginTop: "0.25rem" }}>
                {fieldErrors.name}
              </p>
            )}

            <label>Bio</label>
            <textarea value={bio} onChange={handleBioChange} />
            {fieldErrors.bio && (
              <p style={{ color: "red", marginTop: "0.25rem" }}>
                {fieldErrors.bio}
              </p>
            )}

            <label>
              Private Account
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={() => setIsPrivate((p) => !p)}
              />
            </label>
          </form>
        </div>
      </div>
      {showCoverCrop && tempCoverSrc && (
        <ImageCropModal
          imageSrc={tempCoverSrc}
          aspect={3} // 3:1 pentru cover
          onCancel={() => setShowCoverCrop(false)}
          onApply={onCoverCropped}
        />
      )}
      {/* IMAGE CROP MODAL (overlay peste tot) */}
      {showCrop && tempImageSrc && (
        <ImageCropModal
          imageSrc={tempImageSrc}
          aspect={1} // 1:1 pentru avatar
          onCancel={() => setShowCrop(false)}
          onApply={onProfileCropped}
        />
      )}
    </>
  );
};

export default EditProfileForm;
