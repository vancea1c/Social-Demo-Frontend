// src/components/Widgets/EditProfileForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  profile: Profile;
  onDone: (updated: Profile) => void;
}

const EditProfileForm: React.FC<Props> = ({ profile, onDone }) => {
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('bio', bio);
    if (avatarFile) data.append('profile_image', avatarFile);
    if (coverFile)  data.append('cover_image', coverFile);

    const res = await axios.patch<Profile>(
      `/api/profile/${profile.username}/`,
      data,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    onDone(res.data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={bio} onChange={e => setBio(e.target.value)} />
      <input type="file" accept="image/*" onChange={e => e.target.files && setAvatarFile(e.target.files[0])} />
      <input type="file" accept="image/*" onChange={e => e.target.files && setCoverFile(e.target.files[0])} />
      <button type="submit">Save</button>
    </form>
  );
};

export default EditProfileForm;
