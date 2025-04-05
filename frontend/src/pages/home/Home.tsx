// src/pages/home/Home.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { BookSlider } from "@/components/home/BookSlider";
import { useAuth } from "@/context/AuthContext";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import BookUploadDialog from "@/components/home/BookUploadDialog";
import UserLibrary from "@/components/home/UserLibrary";
import { SettingsPopup } from "@/components/home/SettingsPopup";

// Featured books - you can replace these with your own selections
const books = [
    { 
        id: 1, 
        title: "War and Peace", 
        author: "Leo Tolstoy", 
        cover: "https://upload.wikimedia.org/wikipedia/commons/1/1c/L._N._Tolstoy%2C_by_Prokudin-Gorsky_%28cropped%29.jpg",
        language: "ru"
    },
    { 
        id: 2, 
        title: "Crime and Punishment", 
        author: "Fyodor Dostoevsky", 
        cover: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg/220px-Vasily_Perov_-_%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82_%D0%A4.%D0%9C.%D0%94%D0%BE%D1%81%D1%82%D0%BE%D0%B5%D0%B2%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_-_Google_Art_Project.jpg",
        language: "ru"
    },
    { 
        id: 3, 
        title: "Eugene Onegin", 
        author: "Alexander Pushkin", 
        cover: "https://upload.wikimedia.org/wikipedia/commons/5/56/Kiprensky_Pushkin.jpg",
        language: "ru" 
    },
    { 
        id: 4, 
        title: "The Divine Comedy", 
        author: "Dante Alighieri", 
        cover: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Portrait_de_Dante.jpg/330px-Portrait_de_Dante.jpg",
        language: "it"
    },
];

function Home() {
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectBook = (bookId: number) => {
    setSelectedBookId(bookId);
  };

  const handleStartReading = () => {
    if (selectedBookId) {
      const selectedBook = books.find(book => book.id === selectedBookId);
      if (selectedBook) {
        navigate("/reader", {
          state: {
            bookId: selectedBook.id,
            bookTitle: selectedBook.title,
            bookType: 'featured'
          }
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Linguality</h1>
        <SettingsPopup />
      </header>

      <main>
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Welcome to your language reading journey!</h2>
          {user ? (
            <div>
              <p className="text-lg text-muted-foreground mb-6">
                Explore classic literature and improve your language skills. Choose a book to start reading, 
                upload your own, or practice your vocabulary.
              </p>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <Button size="lg" onClick={() => navigate("/games")}>
                  Practice Words
                </Button>
                <BookUploadDialog />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg text-muted-foreground mb-6">
                Sign in to explore classic literature, improve your language skills, and track your progress.
              </p>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                <GoogleSignInButton />
                <Button size="lg" onClick={() => navigate("/games")}>
                  Try Practice Games
                </Button>
              </div>
            </div>
          )}
        </section>

        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Featured Books</h3>
          <BookSlider
            books={books}
            selectedBookId={selectedBookId}
            onSelectBook={handleSelectBook}
          />
        </section>

        <div className="flex justify-center mb-8">
          <Button
            size="lg"
            onClick={handleStartReading}
            disabled={!selectedBookId}
          >
            Start Reading
          </Button>
        </div>

        {user && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Your Books</h3>
              <BookUploadDialog />
            </div>
            <UserLibrary />
          </section>
        )}
      </main>
    </div>
  );
}

export default Home;
