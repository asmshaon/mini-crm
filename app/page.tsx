import { supabase } from "@/lib/supabase";

type Joke = {
  id: number;
  text: string;
  created_at: string;
};

async function getJokes() {
  const { data, error } = await supabase.from("jokes").select("*").limit(10);

  console.log(">>>>>>>>>>>>>>>>>>", data);

  if (error) throw new Error(`Failed to fetch jokes: ${error.message}`);

  return data as Joke[];
}

export default async function Home() {
  const jokes = await getJokes();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Jokes App</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jokes.map((joke) => (
          <div key={joke.id} className="border rounded-lg p-4 shadow-sm">
            <p className="text-gray-800">{joke.text}</p>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(joke.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
