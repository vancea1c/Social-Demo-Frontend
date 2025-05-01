import React from 'react';
import SearchBar from './SearchBar';

const Widgets: React.FC = () => (
  <aside style={{ padding: '1rem' }}>
    <SearchBar />
    {/* later: <Trending />  <WhoToFollow /> */}
  </aside>
);

export default Widgets;
