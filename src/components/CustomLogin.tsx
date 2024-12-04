import React from 'react';
import { useAuthenticator, Heading, Text, View, Button, TextField } from '@aws-amplify/ui-react';

export function CustomLogin() {
  const { submitForm, isPending } = useAuthenticator();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    await submitForm({ username, password });
  };

  return (
    <View padding="2rem" width="100%" maxWidth="400px">
      <Heading level={3} padding="0 0 1rem">Welcome back</Heading>
      <Text padding="0 0 1rem">Please sign in to your account</Text>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          name="username"
          placeholder="Enter your email"
          required
          marginBottom="1rem"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          required
          marginBottom="1rem"
        />
        <Button type="submit" variation="primary" isLoading={isPending} loadingText="Signing in...">
          Sign In
        </Button>
      </form>
      <View marginTop="1rem">
        <Text>Don't have an account? <Button variation="link">Sign up</Button></Text>
      </View>
    </View>
  );
}

