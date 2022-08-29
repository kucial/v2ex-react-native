import { BLOCK_TYPES } from './constants';
const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align };
  switch (element.type) {
    case BLOCK_TYPES.BLOCKQUOTE:
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case BLOCK_TYPES.H1:
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case BLOCK_TYPES.H2:
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case BLOCK_TYPES.H3:
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      );
    case BLOCK_TYPES.H4:
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

export default Element;
