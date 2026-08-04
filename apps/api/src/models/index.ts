/**
 * Mongoose models barrel.
 * Domain models will be registered and exported from here.
 */

export { UserModel, type IUser } from "./user.model.js";
export { RefreshTokenModel, type IRefreshToken } from "./refresh-token.model.js";
export { PropertyModel, type IProperty } from "./property.model.js";
export { RoomModel, type IRoom } from "./room.model.js";
export { LibraryModel, type ILibrary } from "./library.model.js";
export { EnquiryModel, type IEnquiry } from "./enquiry.model.js";

// Recommendation Engine
export { StudentPreferenceModel, type IStudentPreference } from "./student-preference.model.js";
export { ViewHistoryModel, type IViewHistory } from "./view-history.model.js";
export { SavedSearchModel, type ISavedSearch } from "./saved-search.model.js";
export { RecommendationModel, type IRecommendation } from "./recommendation.model.js";

// Owner CRM
export {
  LeadPipelineModel,
  type ILeadPipeline,
  type IPipelineNote,
  type IPipelineStageHistory,
} from "./lead-pipeline.model.js";
export { CRMTaskModel, type ICRMTask } from "./crm-task.model.js";
export { ActivityLogModel, type IActivityLog } from "./activity-log.model.js";
export { FollowUpModel, type IFollowUp } from "./followup.model.js";
