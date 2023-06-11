import { Typography } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import va from "@vercel/analytics";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { CreateStoryPreview } from "../components/create_story/CreateStoryPreview";
import Layout from "../components/Layout";
import { fetcherPost } from "../lib/fetcher";

type StorytimeStates = InitialState | CreateStoryState | PrepareStoryState;

type InitialState = {
  type: "InitialState";
};
type CreateStoryState = {
  type: "CreateStoryState";
  data: {
    characters: string[];
    subjects: string[];
  };
};
type PrepareStoryState = {
  type: "PrepareStoryState";
  state: GatherInfoStates;
};

type GatherInfoStates =
  | GatherCharactersState
  | GatherSubjectsState
  | GatherInfoDoneState;
type GatherCharactersState = {
  type: "GatherCharactersState";
  characters: string[];
};
type GatherSubjectsState = {
  type: "GatherSubjectsState";
  characters: string[];
  subjects: string[];
};

type GatherInfoDoneState = {
  type: "GatherInfoDoneState";
  characters: string[];
  subjects: string[];
};

const decodeState = (state: any): StorytimeStates => {
  if (!!state) {
    try {
      const encodedState = state as string;
      const decodedState = atob(encodedState);
      const objectState = JSON.parse(decodedState);
      return objectState as StorytimeStates;
    } catch (err: any) {
      console.log("Error decoding state: " + err.message);
    }
  }

  return { type: "InitialState" };
};

const encodeState = (state: StorytimeStates): string => {
  try {
    return btoa(JSON.stringify(state));
  } catch (err: any) {
    console.log("Error encoding state: " + err.message);
    return "";
  }
};

const IndexPage = () => {
  const router = useRouter();
  const [state, setState] = useState<StorytimeStates>({ type: "InitialState" });
  useEffect(() => {
    const objectState = decodeState(router.query.state);
    setState(objectState);
  }, [router.query.state]);

  const handleStateUpdate = (state: StorytimeStates) => {
    const encodedState = encodeState(state);
    router.push(`/?state=${encodedState}`);
  };

  return (
    <Layout title="Storytime!">
      <StorytimeView state={state} onStateUpdate={handleStateUpdate} />
    </Layout>
  );
};

export default IndexPage;

type StorytimeProps = {
  state: StorytimeStates;
  onStateUpdate: (state: StorytimeStates) => void;
};

const StorytimeView = ({ state, onStateUpdate }: StorytimeProps) => {
  switch (state.type) {
    case "InitialState":
      return <LandingView state={state} onStateUpdate={onStateUpdate} />;
    case "PrepareStoryState":
      return <PrepareStoryView state={state} onStateUpdate={onStateUpdate} />;
    case "CreateStoryState":
      return <CreateStoryView state={state} />;
    default:
      console.error("Invalid state " + state);
      console.dir(state);
  }
};

type CreateStoryProps = {
  state: CreateStoryState;
};
const CreateStoryView = ({ state }: CreateStoryProps) => {
  const router = useRouter();

  const createParams = {
    characters: state.data.characters,
    subjects: state.data.subjects,
  };
  const { data, error } = useSWR(["/api/stories", createParams], fetcherPost);

  useEffect(() => {
    va.track("create_story_start");
  }, []);

  useEffect(() => {
    if (!!data?.storyId) {
      router.push(`/stories/${data.storyId}`);
    }
  }, [data]);

  if (error) {
    return (
      <div>
        <CreateStoryPreview
          characters={state.data.characters}
          subjects={state.data.subjects}
        />
        <Alert severity="error">{error.message}</Alert>
      </div>
    );
  }

  return (
    <div>
      <CreateStoryPreview
        characters={state.data.characters}
        subjects={state.data.subjects}
      />
      <LinearProgress />
    </div>
  );
};

type LandingProps = {
  state: StorytimeStates;
  onStateUpdate: (state: StorytimeStates) => void;
};

const LandingView = ({ state, onStateUpdate }: LandingProps) => {
  const handleSelectStory = (e: any) => {
    e.preventDefault();
    onStateUpdate({
      type: "PrepareStoryState",
      state: {
        type: "GatherCharactersState",
        characters: [],
      },
    });
  };
  useEffect(() => {
    va.track("storytime_start");
  }, []);
  return (
    <div>
      <h1>Storytime!</h1>
      <h2>Help me create a...</h2>
      <Box display="flex" flexDirection="column" gap={2}>
        <Button size="large" variant="contained" onClick={handleSelectStory}>
          Kids Story
        </Button>
        <Button size="large" disabled={true} variant="contained">
          Fun Song
        </Button>
        <Button size="large" disabled={true} variant="contained">
          Dad Joke
        </Button>
      </Box>
    </div>
  );
};

type PrepareStoryProps = {
  state: PrepareStoryState;
  onStateUpdate: (state: StorytimeStates) => void;
};

const PrepareStoryView = ({ state, onStateUpdate }: PrepareStoryProps) => {
  const gatherInfoState = state.state;

  useEffect(() => {
    va.track("gather_info_start");
  }, []);

  switch (gatherInfoState.type) {
    case "GatherCharactersState":
      return (
        <GatherCharactersView
          state={gatherInfoState}
          onStateUpdate={onStateUpdate}
        />
      );
    case "GatherSubjectsState":
      return (
        <GatherSubjectsView
          state={gatherInfoState}
          onStateUpdate={onStateUpdate}
        />
      );
    default:
      console.error("Invalid state " + state);
      console.dir(state);
  }
};

type GatherCharactersProps = {
  state: GatherCharactersState;
  onStateUpdate: (state: StorytimeStates) => void;
};

const GatherCharactersView = ({
  state,
  onStateUpdate,
}: GatherCharactersProps) => {
  useEffect(() => {
    va.track("gather_characters_start");
  }, []);

  const handleAdd = (value: string) => {
    const update = Object.assign({}, state);
    update.characters.push(value);
    onStateUpdate({ type: "PrepareStoryState", state: update });
  };
  const handleDone = (value: string | null) => {
    const update = Object.assign({}, state);
    if (value !== null) {
      update.characters.push(value);
    }
    onStateUpdate({
      type: "PrepareStoryState",
      state: {
        type: "GatherSubjectsState",
        characters: update.characters,
        subjects: [],
      },
    });
  };

  return (
    <div>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        paddingBottom={4}
        paddingTop={2}
      >
        <Typography variant="h3">Lets create a story...</Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography>
          Tell me about the first character. Don't just name the character,
          describe them as well.
        </Typography>
        <Typography>
          <i>Example: "Matthew is a 5 year old boy who loves dinosaurs."</i>
        </Typography>
        <SequenceTextInput
          onAdd={handleAdd}
          onDone={handleDone}
          required={state.characters.length == 0}
        />
      </Box>
    </div>
  );
};

type GatherSubjectsProps = {
  state: GatherSubjectsState;
  onStateUpdate: (state: StorytimeStates) => void;
};

const GatherSubjectsView = ({ state, onStateUpdate }: GatherSubjectsProps) => {
  useEffect(() => {
    va.track("gather_subjects_start");
  }, []);

  const handleAddAnother = (value: string) => {
    const update = Object.assign({}, state);
    update.subjects.push(value);
    onStateUpdate({ type: "PrepareStoryState", state: update });
  };
  const handleDone = (value: string | null) => {
    const update = Object.assign({}, state);
    if (value !== null) {
      update.subjects.push(value);
    }
    onStateUpdate({
      type: "CreateStoryState",
      data: {
        characters: update.characters,
        subjects: update.subjects,
      },
    });
  };

  return (
    <div>
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        paddingBottom={4}
        paddingTop={2}
      >
        <Typography variant="h3">Lets create a story...</Typography>
      </Box>
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography>Describe an idea, subject, event, or plotline.</Typography>
        <Typography>
          <i>Example: "Adventures in San Pablo Park."</i>
        </Typography>
        <SequenceTextInput
          onAdd={handleAddAnother}
          onDone={handleDone}
          required={state.subjects.length == 0}
        />
      </Box>
    </div>
  );
};

type SequenceTextInputProps = {
  onAdd: (value: string) => void;
  onDone: (value: string | null) => void;
  required: boolean;
};

const SequenceTextInput = ({
  onAdd,
  onDone,
  required,
}: SequenceTextInputProps) => {
  const [value, setValue] = useState("");
  const valueIsValid = value.length > 10;
  const valueIsValidOrEmpty =
    value.length > 10 || (value.length == 0 && !required);

  const handleAddAnother = (e: any) => {
    e.preventDefault();
    onAdd(value);
    setValue("");
  };

  const handleDone = (e: any) => {
    e.preventDefault();
    if (valueIsValid) {
      onDone(value);
    } else {
      onDone(null);
    }
    setValue("");
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        id="outlined-multiline-static"
        multiline
        rows={4}
        value={value}
        focused
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }}
      />
      <Box display="flex" flexDirection="row" gap={2}>
        <Button
          size="large"
          disabled={!valueIsValid}
          variant="contained"
          onClick={handleAddAnother}
        >
          Add another
        </Button>
        <Button
          size="large"
          disabled={!valueIsValidOrEmpty}
          variant="contained"
          onClick={handleDone}
        >
          Done
        </Button>
      </Box>
    </Box>
  );
};
