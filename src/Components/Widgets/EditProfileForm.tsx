import React, { useState, useEffect, FormEvent } from "react";
import { UserProfile } from "../../contexts/types";
import { z } from "zod";
import CropModal, { CropModalProps } from "../CropModal";
import { RiCameraAiLine } from "react-icons/ri";
import { X } from "react-feather";
import useMediaManager, { CropState } from "../../hooks/useMediaManager";
import { useUserProfiles } from "../../contexts/UserProfilesContext";
import { useAuth } from "../../contexts/AuthContext";

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
  const coverManager = useMediaManager({ maxFiles: 1 });
  const profileManager = useMediaManager({ maxFiles: 1 });
  const [name, setName] = useState(initialData.name);
  const [bio, setBio] = useState(initialData.bio || "");
  const [isPrivate, setIsPrivate] = useState(initialData.is_private);
  const [removedCover, setRemovedCover] = useState(false);
  const [cropTarget, setCropTarget] = useState<null | "cover" | "profile">(
    null
  );

  const { patchProfile, updateProfile: updateUserProfileContext } =
    useUserProfiles();
  const { updateProfile: updateAuthProfile, user } = useAuth();

  const coverOriginal = coverManager.originalPreviews[0] || null;
  const coverPreview =
    coverManager.previews[0] || (removedCover ? null : initialData.cover_image);
  const profileOriginal = profileManager.originalPreviews[0] || null;
  const profilePreview =
    profileManager.previews[0] || initialData.profile_image;

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    bio?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  const hasErrors = !!fieldErrors.name || !!fieldErrors.bio;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const res = nameSchema.safeParse(val.trim());
    setFieldErrors((prev) => ({
      ...prev,
      name: res.success ? undefined : res.error.errors[0].message,
    }));
  };
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setBio(val);
    const res = bioSchema.safeParse(val);
    setFieldErrors((prev) => ({
      ...prev,
      bio: res.success ? undefined : res.error.errors[0].message,
    }));
  };

  const initiateCrop = (type: "cover" | "profile", file: File | null) => {
    if (!file) return;
    if (type === "cover") {
      coverManager.clearAll();
      setRemovedCover(false);
      coverManager.addFiles([file]);
    } else {
      profileManager.clearAll();
      profileManager.addFiles([file]);
    }
    setCropTarget(type);
  };
  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
    initiateCrop("cover", file);
  };
  const handleProfileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    e.target.value = "";
    initiateCrop("profile", file);
  };

  const onCropApply = async (state: CropState) => {
    if (cropTarget === "cover" && state.area)
      await coverManager.doCrop(0, state.area, state);
    if (cropTarget === "profile" && state.area)
      await profileManager.doCrop(0, state.area, state);
    setCropTarget(null);
  };
  const onCropCancel = () => {
    if (cropTarget === "cover") {
      coverManager.clearAll();
      setRemovedCover(false);
    }
    if (cropTarget === "profile") {
      profileManager.clearAll();
    }
    setCropTarget(null);
  };

  const handleRemoveCover = () => {
    coverManager.clearAll();
    setRemovedCover(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("is_private", String(isPrivate));
    if (removedCover) formData.append("cover_image", "");
    else if (coverManager.files[0])
      formData.append("cover_image", coverManager.files[0]);
    if (profileManager.files[0])
      formData.append("profile_image", profileManager.files[0]);
    try {
      setSubmitting(true);
      const updated = await patchProfile(initialData.username, formData);
      if (user?.username === initialData.username) {
        updateAuthProfile(updated);
      }
      onSave(updated);
      onClose();
    } catch (err) {
      console.error("Edit profile failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(
    () => () => {
      coverPreview && URL.revokeObjectURL(coverPreview);
      profilePreview && URL.revokeObjectURL(profilePreview);
    },
    [coverPreview, profilePreview]
  );

  const getModalProps = (): CropModalProps | null => {
    if (cropTarget === "cover" && coverOriginal) {
      return {
        imageSrc: coverOriginal,
        title: "Edit Media",
        initialAspect: 3,
        ratioOptions: [{ label: "3:1", value: 3 }],
        onCancel: onCropCancel,
        onApply: onCropApply,
        applyLabel: "Apply",
      };
    }
    if (cropTarget === "profile" && profileOriginal) {
      return {
        imageSrc: profileOriginal,
        title: "Edit Media",
        initialAspect: 1,
        ratioOptions: [{ label: "1:1", value: 1 }],
        onCancel: onCropCancel,
        onApply: onCropApply,
        applyLabel: "Apply",
      };
    }
    return null;
  };

  const modalProps = getModalProps();

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-white/50">
        <div className="bg-black rounded-xl w-full max-w-2xl overflow-auto shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <button onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <h2 className="text-xl text-white">Edit Profile</h2>
            <button
              onClick={handleSubmit}
              disabled={submitting || hasErrors}
              className="px-4 py-1 text-white rounded-full"
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div
              className={`relative h-60 rounded-lg overflow-hidden ${
                removedCover || !(coverPreview || initialData.cover_image)
                  ? "bg-black"
                  : ""
              }`}
            >
              {!removedCover && (coverPreview ?? initialData.cover_image) && (
                <>
                  <img
                    src={coverPreview ?? initialData.cover_image!}
                    className="object-cover w-full h-full"
                    alt="Cover"
                  />
                  <button
                    type="button"
                    title="Remove photo"
                    className="absolute top-2 right-2 z-20"
                    onClick={handleRemoveCover}
                  >
                    <X size={20} color="white" />
                  </button>
                </>
              )}
              <button
                type="button"
                title="Add photo"
                onClick={() => document.getElementById("cover-input")?.click()}
                className="absolute bottom-2 right-2 w-20 h-20 bg-black bg-opacity-50 rounded-lg flex items-center justify-center hover:bg-opacity-75 transition"
              >
                <RiCameraAiLine className="w-5 h-5 text-white/85" />
              </button>
              <input
                id="cover-input"
                type="file"
                accept="image/*"
                onChange={handleCoverSelect}
                className="hidden"
              />
            </div>
            <div className="relative w-40 h-40 -mt-20 ml-4 rounded-full border-4 border-black overflow-hidden">
              <img
                src={profilePreview}
                className="object-cover w-full h-full rounded-full"
                alt="Avatar"
              />
              <button
                type="button"
                title="Add photo"
                onClick={() =>
                  document.getElementById("profile-input")?.click()
                }
                className="absolute top-17 right-17.5 w-11 h-11 flex items-center justify-center bg-black bg-opacity-50 rounded-full"
              >
                <RiCameraAiLine className=" text-white/85" />
              </button>
              <input
                id="profile-input"
                type="file"
                accept="image/*"
                onChange={handleProfileSelect}
                className="hidden"
              />
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
      </div>
      {modalProps && <CropModal {...modalProps} />}
    </>
  );
};

export default EditProfileForm;
