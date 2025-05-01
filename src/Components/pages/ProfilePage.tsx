// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Profile {
  username: string;
  name: string;
  bio?: string;
  profile_image: string;
  cover_image?: string;
  is_private: boolean;
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    axios
      .get<Profile>(`/api/profile/${username}/`)
      .then(res => setProfile(res.data))
      .catch(() => {/* handle 404 or private */});
  }, [username]);

  if (!profile) return <p>Loading…</p>;

  const isMe = username === /* your auth-context username */;

  return (
    <div>
      <div
        style={{
          backgroundImage: `url(${profile.cover_image})`,
          height: 200,
          backgroundSize: 'cover'
        }}
      />
      <img
        src={profile.profile_image}
        alt={profile.name}
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          marginTop: -60,
          border: '4px solid white'
        }}
      />
      <h1>{profile.name}</h1>
      <p>{profile.bio}</p>
      {isMe && <button onClick={() => setEditing(true)}>Edit Profile</button>}
      {editing && (
        <EditProfileForm
          profile={profile}
          onDone={updated => {
            setProfile(updated);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
