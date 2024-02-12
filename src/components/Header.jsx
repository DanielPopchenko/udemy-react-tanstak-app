import { useIsFetching } from '@tanstack/react-query';

export default function Header({ children }) {
  //  ! useIsFetching checks if react-query fetching data in our entire app
  const fetching = useIsFetching();
  return (
    <>
      {/* Here we are showing global loading indicator */}
      <div id="main-header-loading">{fetching > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
