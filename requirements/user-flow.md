# Flow

1. Store Creates a bunch of **unique** QR codes (ULID)  
   1. Admin will select the quantity.  
   2. Admin can print this QR codes  
      1. Admin selects paper size (eg. A4)  
      2. Admin selects QR code size. (eg. One A4 sheet may have 5 \* 4 \= 20 QRs)  
   3. Store can select an expiry date or keep it valid for perpetuity  
2. Store affixes these QR codes to their products  
3. Store creates a Giveaway/Luckydraw on the store  
   1. Giveaway will be visible on the store  
   2. Giveaway will have a start & end date-time  
   3. Store will select the prizes for the giveaway (1st, 2nd, 3rd, etc… any number)  
   4. At any given point in time only one giveaway will be live for a store.  
   5. So sitting in Feb 2025, Store can create a giveaway for March, April, May, etc… (choosing specific dates & times to start & stop)  
   6. Store can select for which countries do they want to activate the lucky draw (default would be India)  
4. The consumer buys the product (mostly offline through a distributor network) & scans the QR code.  
5. The consumer is taken to a url like [store.com/giveaway?code=unique-code](http://store.com/giveaway?code=unique-code)   
6. On this url, the details of the giveaway active at that point of time is shown with all the prizes & along with a form in which consumers will input their details  
   1. If no giveaway is active or QR code is invalid / used , the same is shown to the user here.  
7. The consumer fills the form with following information  
   1. Name\*  
   2. WhatsApp number (with country code)\*  
   3. Email  
   4. Address  
   5. Pincode  
   6. A checkbox allowing the store to contact the user for marketing purposes.  
8. On submitting the form the consumer gets a SMS on their mobile & email (if available) mentioning their participation in the event.  
   1. This also adds them to the active lucky draw.   
   2. Users get their entry code here.  
   3. The store should auto capture their ip-address & user-agent ([https://uaparser.dev/](https://uaparser.dev/)) during entry.  
   4. Rate-limiting so that nobody tries to brute force multiple entries.  
9. On the end date-time, random entries from the active lucky draw are picked & winners are published on the website.  
   1. Winners get an email & SMS mentioning their winnings & further contact info.  
10. Admin has a dashboard where they can see all the entries, winners & other analytics.