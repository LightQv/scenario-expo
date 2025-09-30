import i18n from "./i18n"

//--- Type Query Choices ---//
export const typeList = [
  {
    id: 1,
    value: "movie",
    label: i18n.t("filter.type.option1"),
  },
  {
    id: 2,
    value: "tv",
    label: i18n.t("filter.type.option2"),
  },
]

//--- Sort Query Choices ---//
export const sortList = [
  {
    id: 1,
    value: "popularity.desc",
    label: i18n.t("filter.sort.option1"),
  },
  {
    id: 2,
    value: "primary_release_date.desc",
    label: i18n.t("filter.sort.option2"),
  },
  {
    id: 3,
    value: "vote_average.desc",
    label: i18n.t("filter.sort.option3"),
  },
]
