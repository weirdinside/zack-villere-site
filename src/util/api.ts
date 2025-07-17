type Venue = {
  name: string;
  city: string;
  country: string;
};

type Offer = {
  type: string;
  url: string;
};

type Event = {
  id: string;
  datetime: string;
  venue: Venue;
  offers: Offer[];
};

const appId = import.meta.env.VITE_ZV_BANDSINTOWN_API_KEY;

export async function getShows(): Promise<Event[] | string | undefined> {
  const artist = "zackvillere";
  const url = `https://rest.bandsintown.com/artists/${artist}/events?app_id=${appId}&date=past`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const events: Event[] = await response.json();

    if (events.length === 0) {
      return "No upcoming events for Zack Villere.";
    } else {
      return events;
    }
  } catch (error) {
    return "There was an error displaying the events.";
  }
}
