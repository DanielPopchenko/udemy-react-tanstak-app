import { useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteEvent, fetchEventDetails, queryClient } from '../../util/http.js';

import Header from '../Header.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEventDetails({ id, signal }),
  });

  // ! we should use this useMutation to properly handle deleting
  const {
    mutate,
    isPending: isPendingDeleting,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        // ! because all events realated queries should be revalidated
        queryKey: ['events'],
        // this allow us not to revalidate all 'events' queries immidiatelly
        // they`ll run again, when they are required
        // ! refetchType makes sure that on THIS SPESIFIC page queries will not be revalidated
        refetchType: 'none',
      });
      navigate('/events');
    },
  });

  const handleStartDeleting = () => {
    setIsDeleting(true);
  };
  const handleStopDeleting = () => {
    setIsDeleting(false);
  };

  const handleDeleteEvent = () => {
    mutate({ id });
  };

  let eventDate;
  if (data) {
    eventDate = new Date(data.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDeleting}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event?</p>

          <div className="form-actions">
            {isPendingDeleting ? (
              <p>Deleting... Please, wait.</p>
            ) : (
              <>
                <button className="button-text" onClick={handleStopDeleting}>
                  Cancel
                </button>
                <button className="button" onClick={handleDeleteEvent}>
                  Delete
                </button>
              </>
            )}
          </div>

          {/* Error handling code */}
          {isErrorDeleting && (
            <ErrorBlock
              title="Failed while deleting event."
              message={error.info?.message || 'Failed to delete an event!'}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      {isError && (
        <ErrorBlock
          title="An error occured, while requesting an event details"
          message={error.info?.message || 'Failed to request event details. Try again!'}
        ></ErrorBlock>
      )}
      {isPending && 'Loading...'}
      {data && (
        <article id="event-details">
          <header>
            <h1>{data.title}</h1>
            <nav>
              <button onClick={handleStartDeleting}>Delete</button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img src={`http://localhost:3000/${data.image}`} alt="" />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {eventDate} / {data.time}
                </time>
              </div>
              <p id="event-details-description">{data.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
