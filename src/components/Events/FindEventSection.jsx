import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { fetchEvents } from '../../util/http';
import LoadingIndicator from '../UI/LoadingIndicator';
import ErrorBlock from '../UI/ErrorBlock';
import EventItem from './EventItem';

export default function FindEventSection() {
  const searchElement = useRef();
  // To make our component rerender
  const [searchTerm, setSearchTerm] = useState();

  // ! ---- WE USE useQuery ONLY TO GET DATA ----

  // ! isLoading will not be true if the request is just disabled
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', { searchTerm: searchTerm }],
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    // ! enabled term does not send a request if it is false,
    // ! and sends when it is true
    enabled: searchTerm !== undefined,
  });

  console.log('data: ', data);

  function handleSubmit(event) {
    event.preventDefault();
    setSearchTerm(searchElement.current.value);
  }

  let content = <p>Please enter a search term and to find events.</p>;

  if (isLoading) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    // ! error.info?.message - this means that we only access message if info is defined
    content = (
      <ErrorBlock
        title="An error occured"
        message={error.info?.message || 'Failed to fetch events!'}
      />
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="all-events-section">
      <header>
        <h2>Find your next event!</h2>
        <form onSubmit={handleSubmit} id="search-form">
          <input type="search" placeholder="Search events" ref={searchElement} />
          <button>Search</button>
        </form>
      </header>
      {content}
    </section>
  );
}
