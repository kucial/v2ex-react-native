const OrderedList = ({ attributes, children, element }) => {
  return (
    <ol {...attributes}>
      {children}
    </ol>
  )
}

export default OrderedList;