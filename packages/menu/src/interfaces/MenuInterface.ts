export interface MenuInterface {
  id?: string
  name?: string
  description?: string
  category?: string
  type?: string
  rank?: number
  routing?: string
  routingType?: string
  icon?: string
  level?: number
  hiddenFlag?: boolean
  parentMenu?: MenuInterface | Promise<MenuInterface>
  createdAt?: Date
  updatedAt?: Date
}
