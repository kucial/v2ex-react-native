const ListItem = ({ attributes, children, element }) => {
  return (
    <li {...attributes}>
      {children}
    </li>
  )
}

export default ListItem;