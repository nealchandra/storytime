'use client';

import * as React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

import { createStory } from '@/actions/stories';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  characters: z.array(
    z.object({
      name: z.string().min(2).max(50),
      description: z.string().min(20).max(400),
    })
  ),
  subject: z.string().min(50).max(1000),
});

export const StoryForm: React.FC<{}> = ({}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      characters: [{ name: '', description: '' }],
      subject: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: 'characters',
    control: form.control,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (d) => {
          setLoading(true);
          await createStory(d);
        })}
        className="space-y-8"
      >
        {fields.map((field, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Character Info</CardTitle>
                {index !== 0 ? (
                  <Icons.trash
                    className="mr-2 h-4 w-4"
                    onClick={() => remove(index)}
                  />
                ) : null}
              </div>
              <CardDescription>Tell us about this character.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <FormField
                control={form.control}
                key={`${field.id}-name`}
                name={`characters.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        className="placeholder:opacity-60"
                        placeholder="Matthew"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What's your character's name?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                key={`${field.id}-description`}
                name={`characters.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        autoComplete="off"
                        className="placeholder:opacity-60"
                        placeholder="A young and adventurous boy with brown hair and wide eyes..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Write a short description for your character
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardHeader>
            <CardTitle>Subject</CardTitle>
            <CardDescription>Tell us about the story.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <FormField
              control={form.control}
              name={'subject'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      autoComplete="off"
                      className="placeholder:opacity-60"
                      placeholder="During a storm evening, Matthew is playing inside with his toys. Suddenly, lightning strikes and the house goes dark. When the lights come on, everything looks the same -- but his toys have come to life!"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>What is the story about?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <div className="flex flex-start align-center">
          <Button
            className="mr-2"
            variant="outline"
            onClick={() => append({ name: '', description: '' })}
          >
            Add character
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Icons.spinner className="mr-4 h-4 w-4 animate-spin" />}
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
};
