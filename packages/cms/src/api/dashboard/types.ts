export interface DashboardStatisticsExamsType {
  active_user_count: number
  batch: number
  passed_count: number
  title: string
  total_user_count: number
  un_passed_count: number
}

export interface DashboardStatisticsTrainingsType {
  active_user_count: number
  batch: number
  title: string
  total_user_count: number
  un_active_user_count: number
}

export interface DashboardStatisticsMaterialCountType {
  count: number
  id: number
  name: string
}

export interface DashboardStatisticsType {
  exam_count: number
  material_count: number
  training_count: number
  exams: DashboardStatisticsExamsType[]
  trainings: DashboardStatisticsTrainingsType[]
  material_by_business_tag: DashboardStatisticsMaterialCountType[]
  material_by_content_tag: DashboardStatisticsMaterialCountType[]
}
