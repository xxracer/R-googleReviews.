import React from 'react';
import ImageEditor from '../../components/admin/ImageEditor';

const ManageHomepage = () => {
  return (
    <div>
      <h1>Manage Homepage</h1>
      <p>Here you can edit the content of the homepage.</p>

      <ImageEditor
        sectionId="homepage_main_image"
        title="Homepage Main Image"
      />

      {/* You can add more editors for other homepage content here */}
    </div>
  );
};

export default ManageHomepage;
