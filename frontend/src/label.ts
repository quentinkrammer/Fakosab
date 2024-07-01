export const label = {
  fieldIsRequired: "Field is required",
  passwordsDontMatch: "Passwords don't match",
  someFieldsContainErrors: "Some fields contain errors",
  passwordResetSuccessfull: "Password has been changed successfully",
  resetCodeGenerated: "Password reset code has been generated successfully",
  newUsernameRegistered: "New username has been registered successfully",
  newProjectCreated: "New project has been created successfully",
  projectAvailabilityChanged: "Project availablity changed sucessfully",
  projectDeleted: (name: string) =>
    `Project "${name}" has been deleted successfully`,
  bookingDeleted: (id: string) =>
    `Booking with ID "${id}" has been deleted successfully`,
  userWasDeleted: (user: string) =>
    `User "${user}" has been deleted successfully`,
};
