const listingRepository = [{
  id: 1,
  title: "Cozy Apartment in Downtown",
  type: "apartment",
  city: "jabalpur",
  area: "ranjhi",
  price: 1200,
  isAvailable: true,
  ownerId: 101},
  {
    id: 2,
    title: "Spacious House with Garden",
    type: "house",
    city: "jabalpur",
    area: "tilhari",
    price: 2500,
    isAvailable: false,
    ownerId: 102
  },
  {
    id:3,
    title: "Modern Room Near Park",
    type: "room",
    city: "jabalpur",
    area: "madhuvan",
    price: 500,
    isAvailable: true,
    ownerId: 103
  }
];

function findAll(){
  return listingRepository;
};

function findById(id){
  return listingRepository.find(listing => listing.id === id);
};

function addListing(newListing){
  const newId = listingRepository.length +1;
  const listingToAdd = {id: newId, ...newListing};
  listingRepository.push(listingToAdd);
  return listingToAdd;
}

function updateListing(id, updatedFields){
  const listing = findById(id);
  if (!listing) {
    return null;
  }
  const updatedListing = {...listing, ...updatedFields};
  const index = listingRepository.findIndex(listing => listing.id === id);
  listingRepository[index] = updatedListing;
  return updatedListing;
}

function deleteListing(id){
  const index = listingRepository.findIndex(listing => listing.id === id);
  if (index === -1) {
    return null;
  }
  return listingRepository.splice(index, 1)[0];
}

module.exports = { findAll, findById, addListing, updateListing, deleteListing };