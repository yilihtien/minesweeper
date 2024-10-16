import Minesweeper from '../components/Minesweeper';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <Minesweeper />
    </main>
  );
}
