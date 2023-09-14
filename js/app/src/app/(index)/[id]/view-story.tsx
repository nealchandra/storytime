import { Typography } from '@mui/material';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import va from '@vercel/analytics';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

import { CreateStoryPreview } from '@/components/create-story-preview';
import { fetcherGet } from '@/lib/fetcher';

type RenderStoryProps = {
  storyId: string;
};
export const RenderStoryView = ({ storyId }: RenderStoryProps) => {
  const { data, error, isLoading } = useSWR(
    () => '/api/stories?storyId=' + storyId,
    fetcherGet,
    { refreshInterval: 1000 }
  );

  if (isLoading) {
    return (
      <div>
        <LinearProgress />
      </div>
    );
  } else if (error) {
    return (
      <div>
        <Alert severity="error">{error.message}</Alert>
      </div>
    );
  } else if (data.state == 'FAILED') {
    va.track('story_create_failure');
    return (
      <div>
        <CreateStoryPreview
          characters={data.input.characters}
          subjects={data.input.subjects}
        />
        <Alert severity="error">Story creation failed</Alert>
      </div>
    );
  } else if (data?.state == 'PENDING') {
    return (
      <div>
        <CreateStoryPreview
          characters={data.input.characters}
          subjects={data.input.subjects}
        />
        <LinearProgress />
      </div>
    );
  } else {
    va.track('story_create_success');
    console.log(`${JSON.stringify(data)}`);
    const story = data.data.story;
    const title = data.data.title;
    const lines = story.split('\n');
    return (
      <div>
        <Typography variant="h2">{title}</Typography>
        {lines.map((line: string, index: number) => {
          return <p key={index}>{line}</p>;
        })}
      </div>
    );
  }
};
