import StoryGenerator from './components/StoryGenerator';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-100 to-purple-100">
      <StoryGenerator />
    </main>
  );
}
