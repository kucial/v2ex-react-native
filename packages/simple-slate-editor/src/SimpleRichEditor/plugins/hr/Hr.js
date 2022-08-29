import { useSelected, useFocused } from 'slate-react';
const Hr = ({ element, attributes, children }) => {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <div {...attributes}>
      {children}
      <div
        contentEditable={false}
        style={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: selected && focused ? '#ccc' : 'transparent',
        }}
      >
        <hr />
      </div>
    </div>
  );
};

export default Hr;
