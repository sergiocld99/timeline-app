export type ButtonProps = {
  handleClick: () => void,
  isActive?: boolean,
  disabled?: boolean
}

export type TravelTableSource = 'travels' | 'crosses' | 'locationViewer'