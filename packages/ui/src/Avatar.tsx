import MuiAvatar from '@mui/material/Avatar';
import * as React from 'react';

function extractInitials(fullName: string): string {
  const parts = fullName.split(/[ -]/);
  let initials = '';

  for (const part of parts) {
    initials += part.charAt(0);
  }

  if (initials.length > 3 && initials.search(/[A-Z]/) !== -1) {
    initials = initials.replace(/[a-z]+/g, '');
  }

  initials = initials.substr(0, 2).toUpperCase();

  return initials;
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

export interface AvatarProps {
  fullName: string;
}

export const Avatar = (props: AvatarProps) => {
  return (
    <MuiAvatar className="UserAvatar" sx={{ width: 24, height: 24, fontSize: 12, bgcolor: stringToColor(props.fullName) }}>
      {extractInitials(props.fullName)}
    </MuiAvatar>
  );
};
