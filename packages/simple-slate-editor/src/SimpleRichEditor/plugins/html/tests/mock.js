export const doc1 = [
  {
    type: 'heading-one',
    children: [
      {
        text: 'Heading one',
      },
    ],
  },
  {
    type: 'heading-two',
    children: [
      {
        text: 'Heading two',
      },
    ],
  },
  {
    type: 'heading-three',
    children: [
      {
        text: 'Heading three',
      },
    ],
  },
  {
    type: 'heading-four',
    children: [
      {
        text: 'Heading four',
      },
    ],
  },
  {
    type: 'heading-five',
    children: [
      {
        text: 'Heading five',
      },
    ],
  },
  {
    type: 'heading-six',
    children: [
      {
        text: 'Heading six',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'This is a paragraph with inline style example: ',
      },
      {
        text: 'bold',
        bold: true,
      },
      {
        text: ', ',
      },
      {
        text: 'italic',
        italic: true,
      },
      {
        text: ', ',
      },
      {
        text: 'underline',
        underline: true,
      },
    ],
  },
];

export const html1 =
  '<h1>Heading one</h1><h2>Heading two</h2><h3>Heading three</h3><h4>Heading four</h4><h5>Heading five</h5><h6>Heading six</h6><p>This is a paragraph with inline style example: <strong>bold</strong>, <em>italic</em>, <u>underline</u></p>';

export const doc2 = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'bold italic',
        bold: true,
        italic: true,
      },
      {
        text: 'bold',
        bold: true,
      },
    ],
  },
];
export const html2 =
  '<p><strong><em>bold italic</em></strong><strong>bold</strong></p>';

export const doc3 = [
  {
    type: 'paragraph',
    children: [
      {
        text: 'This is an image example',
      },
    ],
  },
  {
    type: 'image',
    url: 'https://picsum.photos/id/684/600/400',
    children: [
      {
        text: '',
      },
    ],
  },
];

export const html3 =
  '<p>This is an image example</p><img src="https://picsum.photos/id/684/600/400" />';

export const doc4 = [
  {
    _id: 'enw6gWPjB4I7n1VLmrRM0',
    type: 'heading-one',
    children: [
      {
        text: 'Normalize example',
      },
    ],
  },
  {
    _id: 'fF6DO1rgYbaDWFTrmhJnP',
    type: 'paragraph',
    children: [
      {
        text: 'Duis do ullamco nostrud anim officia ut nulla enim velit nulla veniam aute.',
      },
    ],
  },
];

export const html4 =
  '<h1 data-block-id="enw6gWPjB4I7n1VLmrRM0">Normalize example</h1><p data-block-id="fF6DO1rgYbaDWFTrmhJnP">Duis do ullamco nostrud anim officia ut nulla enim velit nulla veniam aute.</p>';
