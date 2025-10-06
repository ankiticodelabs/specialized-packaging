import React from 'react';
import { useSelector } from 'react-redux';
import { NamedRedirect } from '../../components';

// Redirect logic for NewListingPage
// - If user already has at least 1 listing (draft/published/pendingApproval),
//   redirect to ManageListingsPage (/listings)
// - Otherwise redirect to EditListingPage in "new" flow (draft id)
const draftId = '00000000-0000-0000-0000-000000000000';
const draftSlug = 'draft';

const NewListingRedirect = () => {
  const hasListings = useSelector(state => state.user.currentUserHasListings);

  if (hasListings) {
    return <NamedRedirect name="ManageListingsPage" />;
  }
  return (
    <NamedRedirect
      name="EditListingPage"
      params={{ slug: draftSlug, id: draftId, type: 'new', tab: 'details' }}
    />
  );
};

export default NewListingRedirect;
