const BulletedList = ({ attributes, children, element }) => {
  return (
    <ul {...attributes}>
      {children}
    </ul>
  )
}

export default BulletedList;