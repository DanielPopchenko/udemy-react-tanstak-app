import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchEventDetails, queryClient, updateEvent } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';

// ! The data here outputs instantly, because the data here is cached

export default function EditEvent() {
  const navigate = useNavigate();
  const { state } = useNavigation();
  const { id } = useParams();
  const submit = useSubmit();

  const { data, isError, error } = useQuery({
    queryKey: ['events', id],
    queryFn: ({ signal }) => fetchEventDetails({ id, signal }),
    // ! react-query will use this data without refetching it if this data is less than 10 sec old
    staleTime: 10000,
  });

  // ! OPTIMISTIC UPDATE APPROACH
  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   // ! our mutate func provides data that we pushed on backend here
  //   // ! so we can use it
  //   // ? This onMutate manipulates data without waiting for response from the backend
  //   // ? Optimistic update
  //   onMutate: async (data) => {
  //     // data is an object that has two properties, event and id
  //     const newEvent = data.event;

  //     // ! it allows us to cancel all query updates to not clash data with optimistic updates
  //     // ? Also it returns a promise
  //     await queryClient.cancelQueries({ queryKey: ['events', id] });

  //     const prevEventData = queryClient.getQueryData(['events', id]);

  //     // Here we call setQueryData to manipulate our queries
  //     queryClient.setQueryData(['events', id], newEvent);

  //     // ! this will be that context obj inside onError func
  //     return { prevEventData };
  //   },
  //   onError: (error, data, context) => {
  //     // ! if the mutation fails we are rolling back our old data
  //     queryClient.setQueryData(['events', id], context.prevEventData);
  //   },
  //   //  ! This will be called whenever this mutation is done no matter what
  //   onSettled: () => {
  //     // ? To make sure that we fetch the latest data from back to sync data if smth went wrong
  //     queryClient.invalidateQueries(['events', id]);
  //   },
  // });

  function handleSubmit(formData) {
    //  ? method is PUT otherwise the action function will not be submitted
    // ! This code will not send request,
    // ! IT WILL TRIGER AN ACTION FUNCTION
    submit(formData, { method: 'PUT' });
  }

  function handleClose() {
    navigate('../');
  }

  let content;

  if (error) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={error.info?.message || 'Failed to load an event.'}
        />

        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        {state === 'submitting' ? (
          <p>Sending data...</p>
        ) : (
          <>
            <Link to="../" className="button-text">
              Cancel
            </Link>
            <button type="submit" className="button">
              Update
            </button>
          </>
        )}
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}

export const loader = ({ params }) => {
  return queryClient.fetchQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEventDetails({ id: params.id, signal }),
  });
};

// ! alternative aproach to an OPTIMISTIC UPDATE
// ? this is anothr aproach where we use router-dom features
export const action = async ({ request, params }) => {
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);
  await updateEvent({ id: params.id, event: updatedEventData });

  // ? we should also await this, because invalidate queries returns a promise
  await queryClient.invalidateQueries(['events']);

  return redirect('../');
};
