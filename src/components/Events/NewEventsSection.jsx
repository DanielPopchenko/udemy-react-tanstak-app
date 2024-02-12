import { useQuery } from '@tanstack/react-query';

// ! tanstak features
// ! caches data, so the data is available instantly
// ! updates information instantyl

import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../util/http.js';

export default function NewEventsSection() {
  //  !  {...} -> here we pass the function that sends actual request
  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', { max: 3 }],
    // ! identifier for reusing a data
    queryFn: ({ signal, queryKey }) => fetchEvents({ signal, ...queryKey[1] }),
    // ?
    staleTime: 5000,
    //  ? garbigge collection time
    // gcTime: 1000,
  });

  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || 'Failed to fetch events.'}
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
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
