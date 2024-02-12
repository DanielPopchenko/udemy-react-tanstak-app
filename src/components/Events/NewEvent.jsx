import { Link, useNavigate } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation } from '@tanstack/react-query';
import { createNewEvent, fetchEvents } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

// ! we need to take queryClient out of App.js to some file that is able everywhere
// ! throughout our app
import { queryClient } from '../../util/http.js';

export default function NewEvent() {
  const navigate = useNavigate();

  // ! USE useMutation TO PUT REQUEST
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: createNewEvent,
    //  ! this code will execute if mutation did succeed
    //  ! so any error will be seen here
    onSuccess: () => {
      // ? when we succeed we revalidate our data so we can see brand-new info
      // ! exact: true -> only queries with exactly 'events' key will be invalidated
      queryClient.invalidateQueries({ queryKey: ['events'] });
      navigate('/events');
    },
  });

  function handleSubmit(formData) {
    // mutate is a fn to send our request
    // { event: formData } --> is a structure that our backend expects to get
    mutate({ event: formData });
    // ! so we do not need to do it here, because no matter what, we
    // ! instantly navigate out of the NewEvent modal
    // navigate('/events');
  }

  return (
    <Modal onClose={() => navigate('../')}>
      <EventForm onSubmit={handleSubmit}>
        {isPending ? (
          'Submitting the data...'
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Create
            </button>
          </>
        )}
      </EventForm>
      {isError && (
        <ErrorBlock
          title="An error occured, while creating an event"
          message={error.info?.message || 'Failed to create event. Check your inputs!'}
        ></ErrorBlock>
      )}
    </Modal>
  );
}
