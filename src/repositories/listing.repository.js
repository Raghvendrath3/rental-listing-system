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
  },{
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
module.exports = { findAll, findById };