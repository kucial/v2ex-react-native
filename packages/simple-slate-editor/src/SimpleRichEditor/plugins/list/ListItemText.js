const ListItemText = ({ attributes, children, element }) => {
  return (
    <div {...attributes}>
      {children}
    </div>
  )
}

export default ListItemText;