import React, { useCallback } from 'react';
import { User, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AvatarUploadProps {
  url: string | null;
  onUpload: (url: string) => void;
  size?: number;
}

export default function AvatarUpload({ url, onUpload, size = 150 }: AvatarUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const { user } = useAuth();

  const uploadAvatar = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setUploading(true);

        if (!event.target.files || event.target.files.length === 0) {
          throw new Error('You must select an image to upload.');
        }

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        onUpload(data.publicUrl);
      } catch (error) {
        alert('Error uploading avatar!');
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
    [user, onUpload]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div 
        className="relative group cursor-pointer"
        style={{ width: size, height: size }}
        onClick={() => !uploading && document.getElementById('avatar-upload')?.click()}
      >
        {url ? (
          <img
            src={url}
            alt="Avatar"
            className="rounded-full w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
            <User className="h-1/3 w-1/3 text-gray-400" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Upload className="h-6 w-6 text-white" />
          )}
        </div>
      </div>

      <input
        type="file"
        id="avatar-upload"
        accept="image/*"
        onChange={uploadAvatar}
        disabled={uploading}
        className="hidden"
      />

      <div className="text-center text-sm text-gray-600">
        {uploading ? 'Enviando...' : 'Clique para alterar a foto'}
      </div>
    </div>
  );
}