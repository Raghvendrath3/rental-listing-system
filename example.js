//routing
router.get('/', getEachListings);

//controller
async function getEachListings(req, res, next){
  try {
    const conditions = [];
    const values = [];
    if (req.query.city){
      conditions.push(`city`);
      values.push(req.query.city);
    }
    if (req.query.type){
      conditions.push(`type`);
      values.push(req.query.type);
    }
    if (req.query.priceMin){
      conditions.push(`priceMin`);
      values.push(req.query.priceMin);
    }
    if (req.query.priceMax){
      conditions.push(`priceMax`);
      values.push(req.query.priceMax);
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    console.log("controller is working");

    const listings = await getAllListings(page, limit, conditions, values);
    return res.status(200).json({
      status: 'success',
      results: listings.length,
      data: listings
    });
  } catch (error) {
    next(error);
  }
}

//service
function conditionValidation(conditions, values){
  if (conditions.priceMin && conditions.priceMax){
    const minPrice = values.priceMin;
    const maxPrice = values.priceMax;
    if(minPrice < 0 || maxPrice < 0 || maxPrice <= minPrice){
      return AppError(400, "invalid minimum price amount");
    }
  }
}

async function getAllListings(page, limit, conditions, values){
  conditionValidation(conditions, values);
  const offset = (page - 1) * limit;
  console.log("service is working");
  const listings = await findAllPaginated(limit, offset, conditions, values);
  return listings;
}

//repository
async function findAllPaginated(limit, offset, conditions = {}, values = []) {
  let filterQuery = `SELECT * FROM listings`;
  let placeholder = values.length + 1;

  if (Object.keys(conditions).length > 0) {
    filterQuery += ' WHERE ';
    const filters = [];
    
    if (conditions.city) {
      filters.push(`city = $${placeholder++}`);
      values.push(conditions.city);
    }
    if (conditions.type) {
      filters.push(`type = $${placeholder++}`);
      values.push(conditions.type);
    }
    if (conditions.priceMin !== undefined && conditions.priceMax !== undefined) {
      filters.push(`price >= $${placeholder++}`);
      filters.push(`price <= $${placeholder++}`);
      values.push(conditions.priceMin, conditions.priceMax);
    }
    filterQuery += filters.join(' AND ');
  }

  // Use current placeholder for LIMIT, then increment for OFFSET
  const finalQuery = `${filterQuery} LIMIT $${placeholder++} OFFSET $${placeholder++}`;
  
  const listing = await pool.query(finalQuery, [...values, limit, offset]);
  return listing.rows;
}