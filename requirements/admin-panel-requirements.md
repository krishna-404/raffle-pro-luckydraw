# Admin Panel Requirements

1. Admin Login 
   1. Route: `/admin/login`
   2. The admin can login using their email & password.
2. Admin Register
   1. Route: `/admin/register`
   2. The admin can register using their email & password.
   3. It needs a special token which is available in the environment variables. Only if this token is provided & matches, a new admin can register.
   4. This token should not be exposed to the client side. Take special care to ensure this.
   5. Have strict rate limiting on this route. Permanently block any IP which tries to register more than 2 times.
3. Admin Dashboard (Authenticated)
   Has the following sections:
   1. QR Code Management
      1. A section to add a bunch of new QR codes & print them.
        1. A QR code can have an expiry date.
        2. User can select the quantity of QR codes to be added.
        3. User can select the size of the QR code.
        4. User can select the paper size.
      2. A section to view all the QR codes & their status.
   2. Giveaway Management
      1. A section to create a new giveaway.
        1. User can select the start & end date-time of the giveaway.
        2. User can select the prizes for the giveaway.
        3. User can select the countries for the giveaway, default will be India.
      2. A section to view all the giveaways & their status.
      3. The user select to find the winners of the giveaway & close the giveaway.
   3. Entries Management
      1. A section to view all the entries & their status.
      2. A section to export the entries to a CSV file.
   4. Winners Management
      1. A section to view all the winners & their status.
      2. A section to export the winners to a CSV file.
   
