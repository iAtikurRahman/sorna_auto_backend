const getUser = `SELECT 
  id, 
  employee_id, 
  access_role, 
  name, 
  email, 
  picture, 
  phone, 
  alternative_phone, 
  emergency_number, 
  designation, 
  division, 
  district, 
  thana, 
  country, 
  address, 
  dob, 
  nid, 
  nid_picture, 
  marital_status, 
  bb_routing_no, 
  bank_account_name, 
  bank_account_no, 
  is_active, 
  is_deleted, 
  updated_by, 
  updated_at, 
  created_by, 
  created_at 
FROM users 
limit 10
offset ? `;

module.exports = {
  getUser,
};
