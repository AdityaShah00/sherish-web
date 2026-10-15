/* ============================================================================
   Sherish — all editable content lives here.
   Change copy, dates, events, and the WhatsApp number in THIS file only.
   ========================================================================== */
window.SITE = {
  couple: {
    bride: 'Ishita',
    groom: 'Shreyam',
    hashtag: '#Sherish',
    brideParents: 'Madhu & Nishith Shah',   // Ishita's parents
    groomParents: 'Vaishali & Sandeep Jalan', // Shreyam's parents
  },

  /* Countdown target = the wedding ceremony (pheras). ISO 8601 with IST offset. */
  weddingDate: '2027-02-24T19:00:00+05:30',
  dateLabel: '24ᵗʰ February 2027',

  venue: {
    name: 'Hyatt Regency Jaipur Mansarovar',
    city: 'Jaipur, Rajasthan',
    checkIn: '23 Feb 2027',
    checkOut: '25 Feb 2027',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hyatt+Regency+Jaipur+Mansarovar',
  },

  /* The long-distance love story: Luxembourg <-> Bengaluru */
  journey: {
    from: { name: 'Luxembourg', flag: '🇱🇺', lat: 49.61, lon: 6.13 },
    to:   { name: 'Bengaluru',  flag: '🇮🇳', lat: 12.97, lon: 77.59 },
    miles: 4700,
    caption: 'Two Hearts · One Family',
  },

  /* RSVP — fill the number (country code + number, digits only) before deploy.
     Leave '' to hide the WhatsApp button until you're ready. */
  rsvpWhatsapp: '',            // e.g. '919812345678'
  rsvpMessage: "Hi! We'd love to RSVP for Ishita & Shreyam's wedding 💍",
  travelWhatsapp: '',          // travel-desk WhatsApp (country code + number, digits only)

  /* Events — chronological. `date` (YYYY-MM-DD) drives all-day calendar entries.
     Times are intentionally omitted (TBD). `colors` = dress-code swatches. */
  events: [
    {
      key: 'shubharambh', name: 'Shubh Aarambh', fn: 'Mehendi & Carnival', day: 'Mon · 23 Feb',
      venue: 'Imperial Room',
      dress: 'Color Pop',
      colors: ['#C8266B', '#1E7FC2', '#5BA842'],
      outfit: 'outfit-shubharambh.webp',
      note: 'Henna, a carnival of colour and music to open the celebrations.',
      date: '2027-02-23',
    },
    {
      key: 'shimmer', name: 'Shimmer & Shine', fn: 'Sangeet', day: 'Mon · 23 Feb',
      venue: 'Regency Ballroom',
      dress: 'Evening Bling',
      colors: ['#141414', '#7A1F2B', '#C0A15A'],
      outfit: 'outfit-shimmer.webp',
      note: 'An evening of performances, dancing and dinner — dressed to dazzle.',
      date: '2027-02-23',
    },
    {
      key: 'floral', name: 'The Floral Fair', fn: 'Haldi & Phoolon Ki Holi', day: 'Tue · 24 Feb',
      venue: 'Navras Bagh',
      dress: 'Florals & Pastels',
      colors: ['#F4C430', '#8BC34A', '#F39FC0'],
      outfit: 'outfit-floral.webp',
      note: 'Turmeric, a shower of flower petals and sunshine — soft and fresh.',
      date: '2027-02-24',
    },
    {
      key: 'vows', name: 'The Sacred Vows', fn: 'Wedding', day: 'Tue · 24 Feb',
      venue: 'Chauras Bagh',
      dress: 'Your Ethnic Best',
      colors: ['#8E1B2E', '#E6C19A', '#C9A24B'],
      outfit: 'outfit-vows.webp',
      note: 'The pheras, beneath the stars of the Pink City — in your ethnic best.',
      date: '2027-02-24',
    },
  ],
};
