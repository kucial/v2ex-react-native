export default function Blockquote(props) {
  const { attributes, children } = props;
  return <blockquote {...attributes}>{children}</blockquote>;
}
