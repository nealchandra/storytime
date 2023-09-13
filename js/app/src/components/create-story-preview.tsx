'use client';

import { useTheme } from '@mui/material/styles';

export type CreateStoryPreviewProps = {
  characters: string[];
  subjects: string[];
};

export const CreateStoryPreview = ({
  characters,
  subjects,
}: CreateStoryPreviewProps) => {
  const theme = useTheme();
  return (
    <div>
      <h1>Writing story...</h1>
      <h2>Creating a story about the following characters...</h2>
      <ul style={{ paddingLeft: theme.spacing(2) }}>
        {characters.map((character) => {
          return <li key={character}>{character}</li>;
        })}
      </ul>
      <h2>With the following subjects...</h2>
      <ul style={{ paddingLeft: theme.spacing(2) }}>
        {subjects.map((subject) => {
          return <li key={subject}>{subject}</li>;
        })}
      </ul>
    </div>
  );
};
