import type { Place } from './types';

/*
 * Sheet 19: Morrowmouth and the Levels.
 *
 * Record text may link to another place with [[place-id|words]] and
 * set a ship's name or a title in italic with _underscores_.
 */

export const PLACES: Place[] = [
  {
    id: 'halme',
    name: 'Halme',
    kind: 'city',
    kindLabel: 'City',
    at: [990, 235],
    label: { dx: 0, dy: -68, anchor: 'middle' },
    premise:
      'A city for forty thousand, finished in every particular except occupation. Work stopped on a Saturday. The first resident was due on the Sunday.',
    depictions: {
      i: { status: 'proposed', name: 'Halme (New Town)' },
      ii: { status: 'stands', name: 'Halme' },
      iii: { status: 'stands', name: 'Halme', note: 'uninhabited 1932' },
      iv: { status: 'ruin', name: 'Halme', note: 'disused' },
    },
    records: [
      {
        id: 'halme-ledger',
        kind: 'Wage ledger',
        title: 'Halme Works, week ending 13 March 1909',
        date: '13 March 1909',
        author: 'Clerk of Works, Halme Estates Company',
        basis: 'iv',
        body: {
          form: 'ledger',
          columns: ['Trade', 'Hands', 'Disposal'],
          rows: [
            ['Masons and setters', '212', 'Paid off Saturday noon'],
            ['Glaziers', '40', 'Paid off Saturday noon'],
            ['Paviours', '118', 'Paid off Saturday noon'],
            ['Lamplighters', '6', 'Retained one night'],
            ['Clerk of Works', '1', 'To hand keys to first tenant, Sunday 14th'],
          ],
          foot: 'No tenant presented. Keys retained. Lamplighters not seen to leave.',
        },
      },
      {
        id: 'halme-wire',
        kind: 'Telegram',
        title: 'Halme Estates Company to the Clerk of Works',
        date: '13 March 1909, 4.10 p.m.',
        author: 'Halme Estates Company, in receivership',
        basis: 'iv',
        body: {
          form: 'wire',
          lines: [
            'CEASE ALL WORKS',
            'COMPANY IN RECEIVERSHIP FROM NOON',
            'ADMIT NO TENANT',
            'CHAIN NORTH GATE',
            'ACKNOWLEDGE',
          ],
        },
      },
      {
        id: 'halme-rask',
        kind: 'Letter',
        title: 'Edda Rask, postmistress, to her sister',
        date: '2 February 1909',
        author: 'Edda Rask, Post Office, Halme',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'I have had the post office to myself these five weeks and the town to myself with it. There are three thousand front doors and I have tried a good number. They are all unlocked and all the same inside.',
            'The lamps are lit every evening by a man I have not met. I sort no letters because none come, so I have begun addressing some to myself for the pleasure of the stamp. You will say I should not be here before the town is open. I was sent a date and a key and I used them in the wrong order.',
            'On clear nights there is a light to the west that goes round. I am told it is [[sorrel|a lighthouse]]. I have not asked what for.',
          ],
          signoff: 'Your loving E.',
        },
      },
      {
        id: 'halme-varga',
        kind: 'Field note',
        title: 'Correcting Survey, book 4, Halme',
        date: '11 June 1932',
        author: 'Ines Varga',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'Counted 3,112 dwellings, all glazed, none occupied. Streets as engraved in 1908, to the foot, which I did not expect of that edition. One chimney warm.',
            'Post office open. Counter attended by a woman who declined to be enumerated, on the ground that she has not yet arrived. Entered the town as standing and uninhabited. I am not satisfied with either word.',
          ],
        },
      },
    ],
    finding: {
      question: 'Has anyone ever lived in Halme?',
      options: [
        {
          id: 'never',
          label: 'No one. Enter it as works abandoned the day before opening.',
          status: 'ruin',
          note: 'never occupied',
          cites: ['halme-ledger', 'halme-wire'],
          setsAside: ['halme-rask', 'halme-varga'],
        },
        {
          id: 'one',
          label: 'One person, who moved in before it was finished and has not left.',
          status: 'stands',
          note: 'pop. 1',
          cites: ['halme-rask', 'halme-varga'],
          setsAside: ['halme-wire'],
        },
      ],
    },
  },

  {
    id: 'orrow',
    name: 'Orrow',
    kind: 'island',
    kindLabel: 'Island',
    at: [150, 330],
    label: { dx: 0, dy: 62, anchor: 'middle' },
    premise:
      'An island of some forty acres with a chapel on it, charted five miles off Morrowmouth. Two editions show it, one doubts it, and the fourth shows open water.',
    depictions: {
      i: { status: 'stands', name: 'Isle of Orrow', note: 'chapel' },
      ii: { status: 'stands', name: 'Orrow I.', note: 'landing' },
      iii: { status: 'doubtful', name: 'Orrow', note: 'PD' },
      iv: { status: 'absent', name: 'Orrow' },
    },
    records: [
      {
        id: 'orrow-log',
        kind: 'Ship’s log',
        title: 'Cutter _Perseverant_, off Morrowmouth',
        date: 'June 1869',
        author: 'J. Hale, Master',
        basis: 'i',
        body: {
          form: 'entries',
          entries: [
            ['6 June', 'Stood in for Orrow at first light on the charted bearing. No land. Sounded nine fathoms where the chapel should stand.'],
            ['7 June', 'Fog. At noon heard a bell to the north-west. Did not see what rang it.'],
            ['8 June', 'Orrow plain on the horizon at dawn: low, green, one building. Lost it at seven behind nothing. Colonel Tench, aboard, has entered it as surveyed.'],
          ],
        },
      },
      {
        id: 'orrow-tithe',
        kind: 'Tithe account',
        title: 'Parish of Morrowmouth, Orrow glebe',
        date: '1871–1909',
        author: 'Churchwardens of Morrowmouth',
        basis: 'ii',
        body: {
          form: 'ledger',
          columns: ['Year', 'Rent of glebe', 'How received'],
          rows: [
            ['1871', '£2 4s. 0d.', 'By hand, from a boat'],
            ['1890', '£2 4s. 0d.', 'By post'],
            ['1908', '£2 4s. 0d.', 'By post, no sender'],
            ['1909', 'nil', 'Demand returned: no such place'],
          ],
          foot: 'Thirty-eight years paid in full and on the day. Occupier never named.',
        },
      },
      {
        id: 'orrow-varga',
        kind: 'Field note',
        title: 'Correcting Survey, book 7, Orrow',
        date: '3 September 1933',
        author: 'Ines Varga',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'I am told the island is to be seen from the gallery of [[sorrel|Sorrel Light]] on certain mornings. I climbed the gallery on eleven mornings and saw the Sound.',
            'Entered PD, position doubtful, and not ED, existence doubtful, on the strength of the twelfth.',
          ],
        },
      },
      {
        id: 'orrow-air',
        kind: 'Unit memorandum',
        title: 'Aerial Survey Unit, deletion of Orrow',
        date: '14 January 1961',
        author: 'Officer Commanding, Aerial Survey Unit',
        basis: 'iv',
        body: {
          form: 'prose',
          paragraphs: [
            'Forty-one sorties were flown across the charted position at all states of tide. No land, no shoal breaking, no discolouration of the water. Deletion recommended and carried out.',
            'For completeness: on plate 2217, exposed 04.50 hrs on 9 August 1960, a shadow of about the right shape and size lies on the water. There is nothing above the water to cast it. The plate is otherwise sound.',
          ],
        },
      },
    ],
    finding: {
      question: 'Is there an island at Orrow?',
      options: [
        {
          id: 'none',
          label: 'No. One doubtful sighting in 1869, copied forward for ninety years.',
          status: 'absent',
          note: 'deleted',
          cites: ['orrow-air', 'orrow-log'],
          setsAside: ['orrow-tithe'],
        },
        {
          id: 'island',
          label: 'Yes. Somebody paid rent on it for thirty-eight years.',
          status: 'stands',
          note: 'as charted 1871',
          cites: ['orrow-tithe', 'orrow-log'],
          setsAside: ['orrow-air'],
        },
        {
          id: 'sometimes',
          label: 'At first light, and not otherwise.',
          status: 'doubtful',
          note: 'seen at dawn',
          cites: ['orrow-varga', 'orrow-log', 'orrow-air'],
          setsAside: [],
        },
      ],
    },
  },

  {
    id: 'quillfold',
    name: 'Quillfold Halt',
    kind: 'station',
    kindLabel: 'Railway station',
    at: [730, 392],
    label: { dx: -4, dy: -16, anchor: 'middle' },
    premise:
      'A station built in 1906 for a line that was never laid. It was staffed, lit and swept for twenty-six years.',
    depictions: {
      i: { status: 'absent', name: 'Quillfold' },
      ii: { status: 'stands', name: 'Quillfold' },
      iii: { status: 'struck', name: 'Quillfold Halt', note: 'no railway' },
      iv: { status: 'ruin', name: 'Quillfold', note: 'bldg.' },
    },
    records: [
      {
        id: 'quillfold-timetable',
        kind: 'Public time table',
        title: 'Morrow & Halme Junction Railway, summer service',
        date: 'June 1908',
        author: 'Traffic Manager, M. & H. J. R.',
        basis: 'ii',
        body: {
          form: 'ledger',
          columns: ['Station', 'Down', 'Up'],
          rows: [
            ['Morrowmouth', 'dep. 7.10', 'arr. 9.02'],
            ['Quillfold Halt', '7.34', '8.38'],
            ['Halme', 'arr. 7.58', 'dep. 8.14'],
          ],
          foot: 'Trains call at Quillfold on notice being given to the Guard.',
        },
      },
      {
        id: 'quillfold-daybook',
        kind: 'Stationmaster’s daybook',
        title: 'Quillfold Halt',
        date: '1906–1932',
        author: 'A. Pell, Stationmaster',
        basis: 'iii',
        body: {
          form: 'entries',
          entries: [
            ['1 May 1906', 'Took charge. No rails yet. Swept platform.'],
            ['12 Aug. 1908', 'No train. Sold one ticket, third single to [[halme|Halme]], to a lady with a trunk who said she would wait.'],
            ['3 Jan. 1910', 'Notice of abandonment received. No instruction concerning self. Lamps trimmed.'],
            ['30 Nov. 1932', 'A surveyor called and asked when the last train ran. Said I would look it up.'],
          ],
        },
      },
      {
        id: 'quillfold-minute',
        kind: 'Board minute',
        title: 'Morrow & Halme Junction Railway, minute 212',
        date: '20 December 1909',
        author: 'Secretary to the Board',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'Resolved, that the Company having failed to raise its capital, the line between Morrowmouth and Halme be abandoned, no rail having been laid upon it.',
            'Resolved further, that the Railway Revision of the Survey, having been engraved at the Company’s expense and showing the line complete, be not recalled, there being no money to recall it.',
          ],
        },
      },
      {
        id: 'quillfold-ticket',
        kind: 'Ticket',
        title: 'Third class single, Quillfold to Halme',
        date: 'Found 30 November 1932',
        author: 'Recovered by Ines Varga from the up waiting room',
        basis: 'iii',
        body: {
          form: 'notice',
          heading: 'M. & H. J. R. — Quillfold to Halme — Third Single — No. 0001',
          paragraphs: [
            'The ticket has been clipped. A stationmaster sells a ticket. Only a guard, on a train, clips one.',
          ],
        },
      },
    ],
    finding: {
      question: 'Did a train ever call at Quillfold?',
      options: [
        {
          id: 'never',
          label: 'No. A station was built and a railway was not.',
          status: 'ruin',
          note: 'no line laid',
          cites: ['quillfold-minute', 'quillfold-daybook'],
          setsAside: ['quillfold-ticket', 'quillfold-timetable'],
        },
        {
          id: 'once',
          label: 'Once, on 12 August 1908, for one passenger.',
          status: 'stands',
          note: 'one train, 1908',
          cites: ['quillfold-ticket', 'quillfold-daybook'],
          setsAside: ['quillfold-minute'],
        },
      ],
    },
  },

  {
    id: 'meridian',
    name: 'The Meridian Quarter',
    kind: 'district',
    kindLabel: 'District of Morrowmouth',
    at: [512, 446],
    label: { dx: 40, dy: -30, anchor: 'start' },
    premise:
      'Eleven streets on the east side of Morrowmouth. Every survey has found them. No two have found them lying the same way.',
    depictions: {
      i: { status: 'stands', name: 'Meridian Quarter', angle: 0 },
      ii: { status: 'stands', name: 'Meridian Quarter', angle: 23 },
      iii: { status: 'doubtful', name: 'Meridian Quarter', note: 'traverse does not close', angle: -41 },
      iv: { status: 'stands', name: 'Meridian', angle: 78 },
    },
    records: [
      {
        id: 'meridian-rates',
        kind: 'Rate book',
        title: 'Borough of Morrowmouth, Meridian Ward',
        date: '1871 and 1908',
        author: 'Rating Officer',
        basis: 'ii',
        body: {
          form: 'ledger',
          columns: ['Street', 'Houses', 'Runs, 1871', 'Runs, 1908'],
          rows: [
            ['Meridian Street', '31', 'North and south', 'North-east'],
            ['Noon Row', '18', 'North and south', 'North-east'],
            ['Gnomon Lane', '12', 'East and west', 'South-east'],
            ['Solstice Yard', '6', 'East and west', 'Not found'],
          ],
          foot: 'In both years: 212 houses in eleven streets, every one of them rated and paid.',
        },
      },
      {
        id: 'meridian-brandt',
        kind: 'Letter',
        title: 'Mrs. Ottilie Brandt to the Rating Officer',
        date: '4 May 1908',
        author: 'Ottilie Brandt, 14 Noon Row',
        basis: 'ii',
        body: {
          form: 'prose',
          paragraphs: [
            'Sir, I am rated for a house with a view of the sea. I have a view of the sea until about ten in the morning. After that I have the gasworks, and by evening the hill.',
            'I do not ask for a reduction. I ask to be told which view I am paying for, so that I may be at the window for it.',
          ],
          signoff: 'Yours, O. Brandt',
        },
      },
      {
        id: 'meridian-varga',
        kind: 'Field note',
        title: 'Correcting Survey, book 9, Morrowmouth',
        date: '19 April 1933',
        author: 'Ines Varga',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'Ran the traverse round the Quarter three times. Misclosure fourteen feet; then thirty-one; then nine the other way. Chainmen sober, chain tested.',
            'Entered the streets as found on the third circuit, with the caution that the traverse does not close. The baseline to [[null-cairn|Null Cairn]] should be re-observed before anyone blames the streets.',
          ],
        },
      },
      {
        id: 'meridian-air',
        kind: 'Unit memorandum',
        title: 'Aerial Survey Unit, mosaic of Morrowmouth',
        date: '2 March 1961',
        author: 'Photogrammetric Section',
        basis: 'iv',
        body: {
          form: 'prose',
          paragraphs: [
            'Plates of the Meridian Quarter from three sorties cannot be laid into one mosaic. Street lines fail to meet at the joins by up to four degrees. Camera recalibrated; no fault found.',
            'The sheet is compiled from sortie 3 alone, which was flown at about four in the afternoon.',
          ],
        },
      },
    ],
    finding: {
      question: 'Why does the Quarter not agree with itself?',
      options: [
        {
          id: 'error',
          label: 'Bad survey, four times over. Fix the streets to the 1871 lines.',
          status: 'stands',
          note: 'as 1871',
          angle: 0,
          cites: ['meridian-varga', 'meridian-rates'],
          setsAside: ['meridian-brandt', 'meridian-air'],
        },
        {
          id: 'photograph',
          label: 'Trust the camera. Draw it as photographed at four in the afternoon.',
          status: 'stands',
          note: 'as at 4 p.m.',
          angle: 78,
          cites: ['meridian-air'],
          setsAside: ['meridian-rates', 'meridian-brandt'],
        },
        {
          id: 'turns',
          label: 'It turns with the day. Mrs. Brandt was describing it accurately.',
          status: 'doubtful',
          note: 'turns with the day',
          variant: 'turning',
          cites: ['meridian-brandt', 'meridian-air', 'meridian-varga'],
          setsAside: [],
        },
      ],
    },
  },

  {
    id: 'stannet-hall',
    name: 'Stannet Hall',
    kind: 'hall',
    kindLabel: 'Public building',
    at: [684, 676],
    label: { dx: 22, dy: 5, anchor: 'start' },
    premise:
      'A public hall for the town of Stannet. The papers agree that it mattered. They do not agree that it was built.',
    depictions: {
      i: { status: 'ruin', name: 'Hall', note: 'burnt 1840' },
      ii: { status: 'stands', name: 'Stannet Hall' },
      iii: { status: 'struck', name: 'Stannet Hall', note: 'never begun' },
      iv: { status: 'ruin', name: 'Hall', note: 'footings' },
    },
    records: [
      {
        id: 'stannet-fire',
        kind: 'Claims register',
        title: 'Sun & Anchor Fire Office, claim 4471',
        date: '2 December 1840',
        author: 'Sun & Anchor Fire Office',
        basis: 'i',
        body: {
          form: 'ledger',
          columns: ['Risk', 'Loss', 'Paid'],
          rows: [['Stannet Hall, a public building of stone', 'Destroyed by fire, 9 November 1840', '£4,100 to the Trustees']],
          foot: 'Inspected by the Office’s surveyor, who reports the ruins still warm.',
        },
      },
      {
        id: 'stannet-moreau',
        kind: 'Architect’s drawing',
        title: 'Design for a public hall at Stannet, first scheme',
        date: '1846',
        author: 'L. Moreau, Architect',
        basis: 'iii',
        body: {
          form: 'notice',
          heading: 'Design for a Public Hall at Stannet. First scheme. L. Moreau, 1846.',
          paragraphs: [
            'Note on the sheet, in the architect’s hand: “The ground is clear and has never been built upon. I am told a hall of mine burned here six years ago and should like to see the drawings.”',
          ],
        },
      },
      {
        id: 'stannet-mason',
        kind: 'Mason’s account',
        title: 'R. Thwaite, mason, to the Trustees of Stannet Hall',
        date: 'Michaelmas 1847',
        author: 'R. Thwaite',
        basis: 'iv',
        body: {
          form: 'ledger',
          columns: ['Work', 'Measure', 'Charge'],
          rows: [
            ['Excavating and laying footings', '212 ft run', '£318'],
            ['Walling above footings', 'none', 'nil'],
          ],
          foot: 'Stopped by order of the Trustees, the building fund having been spent on reinstatement after the fire.',
        },
      },
      {
        id: 'stannet-plate',
        kind: 'Cast iron plate',
        title: 'Inscription photographed for the Railway Revision',
        date: 'Photographed 1908',
        author: 'Drawing Office, M. & H. J. R.',
        basis: 'ii',
        body: {
          form: 'notice',
          heading: 'This Hall was erected by public subscription and opened on the first of May 1852',
          paragraphs: ['The plate is bolted to a gatepost. There is no gate, and the draughtsman did not go past it.'],
        },
      },
    ],
    finding: {
      question: 'What has stood at Stannet?',
      options: [
        {
          id: 'footings',
          label: 'Footings, and nothing above them. The hall was never built.',
          status: 'struck',
          note: 'never built',
          cites: ['stannet-mason', 'stannet-moreau'],
          setsAside: ['stannet-plate', 'stannet-fire'],
        },
        {
          id: 'opened',
          label: 'A hall, opened in 1852, as the plate says.',
          status: 'stands',
          note: 'opened 1852',
          cites: ['stannet-plate'],
          setsAside: ['stannet-mason', 'stannet-fire'],
        },
        {
          id: 'burnt',
          label: 'A hall that burned in 1840, six years before it was designed.',
          status: 'ruin',
          note: 'burnt 1840, designed 1846',
          cites: ['stannet-fire', 'stannet-moreau', 'stannet-mason'],
          setsAside: [],
        },
      ],
    },
  },

  {
    id: 'sorrel',
    name: 'Sorrel Light',
    kind: 'light',
    kindLabel: 'Lighthouse',
    at: [655, 215],
    label: { dx: 16, dy: 5, anchor: 'start' },
    premise:
      'A lighthouse six miles from the sea, built to mark a harbour that was sanctioned and never dug. It was lit every night for fifty-seven years.',
    depictions: {
      i: { status: 'stands', name: 'Sorrel Harbour & Light', variant: 'harbour' },
      ii: { status: 'stands', name: 'Sorrel Lt.' },
      iii: { status: 'struck', name: 'Sorrel Lt.', note: 'extinguished 1931' },
      iv: { status: 'ruin', name: 'Tower', note: 'disused' },
    },
    records: [
      {
        id: 'sorrel-log',
        kind: 'Keeper’s log',
        title: 'Sorrel Light',
        date: '1874–1931',
        author: 'Keepers of Sorrel Light',
        basis: 'ii',
        body: {
          form: 'entries',
          entries: [
            ['1 Oct. 1874', 'Light first exhibited. Vessels passing: none. Visibility good.'],
            ['14 Feb. 1890', 'Vessels passing: none. A heron.'],
            ['13 Mar. 1909', 'Glow to the eastward all night, as of [[halme|a town with every lamp lit]]. Vessels passing: none.'],
            ['31 Dec. 1931', 'Ordered to extinguish. Complied at 11.58 p.m. Vessels passing: none.'],
          ],
        },
      },
      {
        id: 'sorrel-notice',
        kind: 'Notice to Mariners',
        title: 'No. 14 of 1875',
        date: 'January 1875',
        author: 'The Lights Board',
        basis: 'i',
        body: {
          form: 'notice',
          heading: 'Sorrel Light. Caution.',
          paragraphs: [
            'Mariners are cautioned that the light at Sorrel, flashing white every ten seconds, stands six miles inland of the present coast and marks a harbour not yet excavated.',
            'It is on no account to be steered for.',
          ],
        },
      },
      {
        id: 'sorrel-farmer',
        kind: 'Letter',
        title: 'G. Arkwell, Sorrel Farm, to the Lights Board',
        date: '9 November 1902',
        author: 'G. Arkwell',
        body: {
          form: 'prose',
          paragraphs: [
            'The beam has passed my bedroom every ten seconds for twenty-eight years and my herd will not lie down facing it.',
            'I am told it guides ships. I have farmed here all my life and in that time I have not lost one ship.',
          ],
          signoff: 'G. Arkwell',
        },
      },
      {
        id: 'sorrel-air',
        kind: 'Unit memorandum',
        title: 'Aerial Survey Unit, night sortie 17 February 1960',
        date: '18 February 1960',
        author: 'Pilot’s report, countersigned',
        basis: 'iv',
        body: {
          form: 'prose',
          paragraphs: [
            'A white light, flashing with a period of ten seconds, was observed at the position of the disused tower at Sorrel and held in view for nineteen minutes.',
            'Reported to the Lights Board, who reply that the lantern was taken out in 1932 and is in their store, where they have looked at it.',
          ],
        },
      },
    ],
    finding: {
      question: 'Is a light still shown at Sorrel?',
      options: [
        {
          id: 'dark',
          label: 'No. Extinguished on the last night of 1931.',
          status: 'struck',
          note: 'extinguished 1931',
          cites: ['sorrel-log'],
          setsAside: ['sorrel-air'],
        },
        {
          id: 'lit',
          label: 'Yes. Flashing white, every ten seconds.',
          status: 'stands',
          note: 'Fl. 10s',
          variant: 'lit',
          cites: ['sorrel-air', 'sorrel-log'],
          setsAside: [],
        },
      ],
    },
  },

  {
    id: 'tolland-bridge',
    name: 'Tolland Bridge',
    kind: 'bridge',
    kindLabel: 'Bridge',
    at: [940, 486],
    label: { dx: -18, dy: 24, anchor: 'end' },
    premise:
      'A bridge of seven arches over the Morrow, of which four were built. Tolls were taken at the north end for thirty years.',
    depictions: {
      i: { status: 'stands', name: 'Tolland Bridge' },
      ii: { status: 'stands', name: 'Tolland Br.' },
      iii: { status: 'struck', name: 'Tolland Bridge', note: '4 arches of 7' },
      iv: { status: 'ruin', name: 'Pier' },
    },
    records: [
      {
        id: 'tolland-vestry',
        kind: 'Vestry minute',
        title: 'Parish of Tolland South',
        date: '6 April 1888',
        author: 'Vestry Clerk',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'Put to the meeting, whether the Parish will receive the bridge upon its bank. For, two. Against, sixty-one.',
            'The Parish has no wish to be reached. The Clerk is to write and say so.',
          ],
        },
      },
      {
        id: 'tolland-tolls',
        kind: 'Toll receipts',
        title: 'Tolland Bridge, north gate',
        date: '1889',
        author: 'Toll-keeper',
        basis: 'ii',
        body: {
          form: 'ledger',
          columns: ['Class', 'Number', 'Toll'],
          rows: [
            ['Foot passengers, out and back', '2,310', '1d.'],
            ['Foot passengers, out only', '17', '1d.'],
            ['Carts and carriages', '0', '6d.'],
          ],
          foot: 'The toll is for the walk to the fourth arch and the view from it. No refund has been asked for.',
        },
      },
      {
        id: 'tolland-engineer',
        kind: 'Letter',
        title: 'The bridge engineer to the Commissioners',
        date: '30 January 1889',
        author: 'H. Calloway, Engineer',
        basis: 'i',
        body: {
          form: 'prose',
          paragraphs: [
            'I have built from the north bank to midstream exactly as contracted and I decline to be asked about the rest. Three arches belong to the south bank and the south bank may have them when it likes.',
            'The keeper tells me of persons who pay out only. I have seen one myself at dusk, who walked to the end and did not come back by me. I assume a boat.',
          ],
          signoff: 'H. Calloway',
        },
      },
      {
        id: 'tolland-varga',
        kind: 'Field note',
        title: 'Correcting Survey, book 5, Tolland',
        date: '22 May 1933',
        author: 'Ines Varga',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'Four arches stand. Struck out the other three.',
            'On the south bank, directly opposite the broken end, there are steps worn down to the water and a path trodden from them to the road. Nobody in Tolland South could tell me who uses it. Several asked me not to put it on the map.',
          ],
        },
      },
    ],
    finding: {
      question: 'Does Tolland Bridge cross the Morrow?',
      options: [
        {
          id: 'half',
          label: 'No. Four arches and a parapet, ending over the water.',
          status: 'ruin',
          note: '4 arches',
          cites: ['tolland-vestry', 'tolland-varga'],
          setsAside: ['tolland-tolls'],
        },
        {
          id: 'crosses',
          label: 'Yes, for those who pay out only.',
          status: 'stands',
          note: 'crossed on foot',
          cites: ['tolland-tolls', 'tolland-engineer', 'tolland-varga'],
          setsAside: ['tolland-vestry'],
        },
      ],
    },
  },

  {
    id: 'ansel',
    name: 'Ansel Water',
    kind: 'reservoir',
    kindLabel: 'Reservoir',
    at: [1300, 722],
    label: { dx: 0, dy: 54, anchor: 'middle' },
    premise:
      'A reservoir shown full on the Correcting Survey. The village in its bed was emptied in 1929. The dam was never closed.',
    depictions: {
      i: { status: 'stands', name: 'Nether Ansel', variant: 'village' },
      ii: { status: 'stands', name: 'Nether Ansel', variant: 'village' },
      iii: { status: 'stands', name: 'Ansel Water', note: 'T.W.L. 412 ft', variant: 'lake' },
      iv: { status: 'ruin', name: 'Nether Ansel', note: 'ruins', variant: 'village' },
    },
    records: [
      {
        id: 'ansel-notice',
        kind: 'Public notice',
        title: 'Morrow Water Board, Nether Ansel',
        date: '1 March 1929',
        author: 'Clerk to the Morrow Water Board',
        basis: 'iii',
        body: {
          form: 'notice',
          heading: 'Nether Ansel. Notice to quit.',
          paragraphs: [
            'All persons are required to quit the village on or before Michaelmas, 29 September 1929, the valley being wanted for water.',
            'The church bell will be removed. The Board cannot undertake to remove anything else.',
          ],
        },
      },
      {
        id: 'ansel-report',
        kind: 'Annual report',
        title: 'Morrow Water Board, year to March 1933',
        date: 'April 1933',
        author: 'Engineer to the Board',
        basis: 'iii',
        body: {
          form: 'ledger',
          columns: ['Ansel Water', 'As designed', 'As measured'],
          rows: [
            ['Top water level', '412 ft', '412 ft'],
            ['Greatest depth', '46 ft', '46 ft'],
            ['Capacity', '310 million gallons', '310 million gallons'],
            ['Yield to supply', '2 million gallons a day', 'nil'],
          ],
          foot: 'The Engineer regrets that the scour valve cannot at present be closed, the key having been left in the village.',
        },
      },
      {
        id: 'ansel-varga',
        kind: 'Field note',
        title: 'Correcting Survey, book 12, last page but one',
        date: '2 February 1934',
        author: 'Ines Varga',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'Did not visit. I had three weeks and the Board’s report gives the level and the depth to the foot.',
            'Entered Ansel Water from the report. I have struck out so much of this sheet on other people’s word that I thought I might add one thing on it.',
          ],
        },
      },
      {
        id: 'ansel-postcard',
        kind: 'Postcard',
        title: 'View of Ansel Water, posted at Nether Ansel',
        date: 'Postmarked 6 August 1935',
        author: 'Signed “P.”',
        body: {
          form: 'prose',
          paragraphs: [
            'Dear Mother, we have rowed right over the church. You can see the weathercock a yard under the boat and it still turns. Weather fine. Back Tuesday.',
          ],
          signoff: 'P.',
        },
      },
    ],
    finding: {
      question: 'Is there water at Ansel?',
      options: [
        {
          id: 'dry',
          label: 'No. A dry valley and an empty village, as photographed.',
          status: 'ruin',
          note: 'dry valley',
          name: 'Nether Ansel',
          variant: 'village',
          cites: ['ansel-varga', 'ansel-report'],
          setsAside: ['ansel-postcard'],
        },
        {
          id: 'full',
          label: 'Yes. Forty-six feet of it, over the church.',
          status: 'stands',
          note: '46 ft',
          name: 'Ansel Water',
          variant: 'lake',
          cites: ['ansel-postcard', 'ansel-report'],
          setsAside: ['ansel-varga'],
        },
      ],
    },
  },

  {
    id: 'two-cuts',
    name: 'The Two Cuts',
    kind: 'canal',
    kindLabel: 'Canal',
    at: [1040, 618],
    label: { dx: 58, dy: 36, anchor: 'start' },
    premise:
      'A canal dug from both ends by two contractors, each holding the true line. The cuts pass each other three hundred yards apart.',
    depictions: {
      i: { status: 'stands', name: 'Marrable’s Navigation', variant: 'single' },
      ii: { status: 'stands', name: 'Old Canal', variant: 'single' },
      iii: { status: 'struck', name: 'The Two Cuts', note: 'do not meet', variant: 'both' },
      iv: { status: 'ruin', name: 'Drains', variant: 'both' },
    },
    records: [
      {
        id: 'cuts-north',
        kind: 'Contractor’s certificate',
        title: 'North Cut',
        date: '1 June 1883',
        author: 'Josiah Marrable, contractor',
        basis: 'i',
        body: {
          form: 'prose',
          paragraphs: [
            'I certify that the North Cut has been driven four miles and 310 yards from the Morrow, on the line and level given me by the Commissioners’ plan, sheet 19, without deviation.',
            'The South Cut is not where it should be.',
          ],
          signoff: 'J. Marrable',
        },
      },
      {
        id: 'cuts-south',
        kind: 'Contractor’s certificate',
        title: 'South Cut',
        date: '1 June 1883',
        author: 'Enoch Marrable, contractor',
        basis: 'i',
        body: {
          form: 'prose',
          paragraphs: [
            'I certify that the South Cut has been driven seven miles and 90 yards from Stannet Wharf, on the line and level given me by the Commissioners’ plan, sheet 19, without deviation.',
            'The North Cut is eleven feet too high and in the wrong field.',
          ],
          signoff: 'E. Marrable',
        },
      },
      {
        id: 'cuts-minute',
        kind: 'Commissioners’ minute',
        title: 'Morrow Improvement Commissioners',
        date: '14 February 1884',
        author: 'Clerk to the Commissioners',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'The Engineer reports that both contractors have worked faithfully to sheet 19, and that the two copies of sheet 19 supplied to them are not alike, each having been traced from the other.',
            'Resolved, that neither contractor is in breach. Resolved, that both be paid. Resolved, that no further plan be issued until it is known which copy was the original.',
          ],
        },
      },
      {
        id: 'cuts-keeper',
        kind: 'Annual returns',
        title: 'Lock-keeper, Junction Lock',
        date: '1881–1901',
        author: 'Lock-keeper, appointed 1881',
        body: {
          form: 'entries',
          entries: [
            ['1884', 'Nothing has come through. Gates oiled.'],
            ['1892', 'Nothing has come through. Gates oiled. Beg to be told where the lock is.'],
            ['1901', 'Nothing has come through. Have built a lock in the field between the cuts so as to have gates to oil.'],
          ],
        },
      },
    ],
    finding: {
      question: 'Which cut is on the true line?',
      options: [
        {
          id: 'north',
          label: 'The North Cut. It starts from the river, which has not moved.',
          status: 'stands',
          note: 'north cut true',
          variant: 'north',
          cites: ['cuts-north'],
          setsAside: ['cuts-south'],
        },
        {
          id: 'south',
          label: 'The South Cut. It starts from the wharf, which was built first.',
          status: 'stands',
          note: 'south cut true',
          variant: 'south',
          cites: ['cuts-south'],
          setsAside: ['cuts-north'],
        },
        {
          id: 'neither',
          label: 'Neither. Each plan was traced from the other and there is no original.',
          status: 'struck',
          note: 'no true line',
          variant: 'both',
          cites: ['cuts-minute', 'cuts-keeper'],
          setsAside: [],
        },
      ],
    },
  },

  {
    id: 'null-cairn',
    name: 'Null Cairn',
    kind: 'datum',
    kindLabel: 'Origin of the survey',
    at: [1480, 540],
    label: { dx: 16, dy: 5, anchor: 'start' },
    premise:
      'The origin of the survey: a brass bolt set in rock, from which every distance on this sheet was measured. Each edition records it in a different place.',
    depictions: {
      i: { status: 'stands', name: 'Station Zero', at: [1480, 540] },
      ii: { status: 'stands', name: 'Null Cairn', note: 're-established', at: [1504, 520] },
      iii: { status: 'stands', name: 'Null Cairn', note: '3 bolts found', at: [1461, 561] },
      iv: { status: 'stands', name: 'Null Cairn', note: 'mean position', at: [1492, 551] },
    },
    records: [
      {
        id: 'null-tench',
        kind: 'Description of stations',
        title: 'Proposing Survey, Station Zero',
        date: '4 May 1868',
        author: 'Col. Aubrey Tench',
        basis: 'i',
        body: {
          form: 'prose',
          paragraphs: [
            'Station Zero is a brass bolt, one inch in diameter, leaded into the living rock at the summit of Null Fell and cut with a cross. All measures of this Survey proceed from it.',
            'It cannot be moved. There is nothing beneath it but the world.',
          ],
        },
      },
      {
        id: 'null-railway',
        kind: 'Office memorandum',
        title: 'Drawing Office, M. & H. J. R.',
        date: '11 October 1907',
        author: 'Chief Draughtsman',
        basis: 'ii',
        body: {
          form: 'prose',
          paragraphs: [
            'The Survey’s origin bolt being found inconvenient to the Company’s baseline, it has been re-established 58 feet to the north-east on a concrete pillar.',
            'The old bolt has been left in place to avoid confusion.',
          ],
        },
      },
      {
        id: 'null-varga',
        kind: 'Field note',
        title: 'Correcting Survey, book 12, last page',
        date: '20 February 1934',
        author: 'Ines Varga',
        basis: 'iii',
        body: {
          form: 'prose',
          paragraphs: [
            'Found the bolt. Found a second bolt. Found the pillar, with a third. Each is cut with a cross and each is described, in good faith, as the origin. I measured between them and the three distances will not make a triangle.',
            'I have corrected this sheet for three years from a point I cannot identify: [[meridian|the Quarter]], [[two-cuts|the Cuts]], [[orrow|the island]], all of it. I would strike out the whole sheet if there were anywhere to stand while I did it.',
          ],
        },
      },
      {
        id: 'null-air',
        kind: 'Unit memorandum',
        title: 'Aerial Survey Unit, ground control',
        date: '9 May 1962',
        author: 'Photogrammetric Section',
        basis: 'iv',
        body: {
          form: 'prose',
          paragraphs: [
            'The Unit adopted the cairn as photographed. It appears on sorties 1, 2 and 3 in positions differing by more than the error of the camera. The mean position has been used.',
            'The Unit wishes it recorded that the mean of three places is a fourth place.',
          ],
        },
      },
    ],
    finding: {
      question: 'Where is the origin of the survey?',
      options: [
        {
          id: 'tench',
          label: 'Where Tench set it in 1868. Everything since is a copy.',
          status: 'stands',
          note: 'as set 1868',
          cites: ['null-tench'],
          setsAside: ['null-railway', 'null-varga', 'null-air'],
        },
        {
          id: 'mean',
          label: 'At the mean of every position recorded, knowing that is a fifth place.',
          status: 'stands',
          note: 'mean of four',
          variant: 'mean',
          cites: ['null-air', 'null-varga'],
          setsAside: ['null-tench'],
        },
        {
          id: 'reader',
          label: 'Wherever the person reading the sheet is standing.',
          status: 'doubtful',
          note: 'origin: the reader',
          variant: 'reader',
          cites: ['null-varga'],
          setsAside: ['null-tench', 'null-railway', 'null-air'],
        },
      ],
    },
  },
];

/** No prototype, so an address like #/place/constructor finds nothing rather than something inherited. */
export const PLACE_BY_ID: Record<string, Place> = Object.assign(
  Object.create(null),
  Object.fromEntries(PLACES.map((p) => [p.id, p])),
);

/** The origin is heard last: every other place on the sheet was measured from it. */
export const KEYSTONE = 'null-cairn';
