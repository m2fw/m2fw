import {
  ADD_PAGES,
  NAVIGATE,
  SET_HOME_ROUTE,
  SWITCH_TO_IMPORTED,
} from '../actions/route'
import { PageDetail, RouteState } from '../../interfaces'

const INITIAL_STATE: RouteState = {
  homeRoute: '',
  title: '',
  route: '',
  pages: [],
}

export const route = (
  state = INITIAL_STATE,
  action: RouteState & { type: string }
) => {
  switch (action.type) {
    case SET_HOME_ROUTE: {
      return {
        ...state,
        homeRoute: action.homeRoute,
      }
    }

    case ADD_PAGES:
      return {
        ...state,
        pages: [
          ...state.pages,
          ...extractValidPages(state.pages, action.pages),
        ],
      }

    case NAVIGATE:
      return {
        ...state,
        title: action.title,
        route: action.route,
      }

    case SWITCH_TO_IMPORTED:
      return {
        ...state,
        pages: state.pages.map((page: PageDetail) => {
          if (page.route === action.route) page.imported = true
          return page
        }),
      }

    default:
      return state
  }
}

/**
 * @description Extract out valid page list which is can be added to current state and return it as an array
 *
 * @param {PageDetail[]} currentPages
 * @param {PageDetail[]} newPages
 * @returns IPageDetail[]
 */
function extractValidPages(
  currentPages: PageDetail[],
  newPages: PageDetail[] = []
): PageDetail[] {
  const currentPageRouters: string[] = currentPages.map(
    (page: PageDetail) => page.route
  )

  return newPages.filter(
    (page: PageDetail) => currentPageRouters.indexOf(page.route) === -1
  )
}
