import Investigations from "../schemas/Investigations.schema";
import Investigators from "../schemas/Investigatiors.schema";
import InvestigationImages from "../schemas/InvestigationImages.schema";
import InvestigationComments from "../schemas/InvestigationComments.schema";
import InvestigationUpdates from "../schemas/InvestigationUpdates.schema";
import BikeImages from "../schemas/BikeImages.schema";
import Reports from "../schemas/Reports.schema";
import Users from "../schemas/User.schema";
import _ from "lodash";
import {
  ClientNotAcceptableError,
  ClientNotFoundError,
} from "../utils/errorhandler";

/**
 * Creates a new investigation. A new investigation is created from
 * a report and the user id of the officer launching the investigation.
 *
 * @param {string} reportId - The id of the report.
 * @param {string} investigatorId - The id of the primary investigator.
 *
 * @return {string} the id of the new created investigation.
 */
export async function create(reportId: number, investigatorId: number) {
  let investigation = await Investigations.findOne({
    where: { report_id: reportId, open: true },
  });

  if (investigation) {
    throw new ClientNotAcceptableError(
      "Client",
      "Investigation already present",
      `An open investigation of report ${reportId} already exists.`
    );
  }

  let newInvestigation = await Investigations.create({ report_id: reportId });
  let investigationObject: any = newInvestigation.toJSON();
  let newInvestigator = await Investigators.create({
    investigator_id: investigatorId,
    investigation_id: investigationObject.id,
  });

  await Reports.update({ investigating: true }, { where: { id: reportId } });
  return investigationObject.id;
}

/**
 * Gets all investigation information, including images, updates, and comments.
 *
 * @param opts - Options.
 *
 * @returns {object} investigation information.
 */
export async function getInvestigations(opts: {
  reportId?: number;
  reportAuthor?: number;
  open?: boolean;
}) {
  let query: any = {};

  console.log(opts);
  if (opts.reportId) {
    query.report_id = opts.reportId;
  }

  if (opts.reportAuthor) {
    if (isNaN(Number(opts.reportAuthor))) {
      let user = await Users.findOne({
        where: { username: opts.reportAuthor },
      });

      if (!user) {
        return [];
      }

      opts.reportAuthor = (user.toJSON() as any).id;
    }

    let reports = await Reports.findAll({
      where: { author: opts.reportAuthor as number },
    });

    if (!reports) {
      return [];
    }

    let ids = _.map(reports, (report) => (report.toJSON() as any).id);
    query.report_id = ids;
  }

  if (opts.open) {
    query.open = opts.open;
  }

  console.log(query);
  let investigations = await Investigations.findAll({
    where: query,
    attributes: ["id"],
  });

  return _.map(
    investigations,
    (investigation) => (investigation.toJSON() as any).id
  );
}

/**
 * Closes an investigation. Changes an investigations status from
 * open to closed.
 *
 * @param {string} investigationId - The id of the investigation.
 */
export async function close(investigationId: number) {
  let investigation = await Investigations.findOne({
    where: { id: investigationId },
    attributes: ["open", "report_id"],
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Investigation not found",
      `Investigation under id ${investigationId} was not found.`
    );
  }

  let object: any = investigation.toJSON();

  if (!object.open) {
    throw new ClientNotAcceptableError(
      "Client",
      "Investigation already closed",
      `Investigation under id ${investigationId} was already closed.`
    );
  }

  await Investigations.update(
    { open: false },
    { where: { id: investigationId } }
  );
  await Reports.update(
    { investigating: false },
    { where: { id: object.report_id } }
  );
}

/**
 * Gets information on one investigation, including images, updates, and comments.
 *
 * @param {string} investigationId - The id of an investigation.
 *
 * @returns {object} investigation object.
 */
export async function getInvestigation(investigationId: number) {
  let investigation = await Investigations.findOne({
    where: { id: investigationId },
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Parameter not found",
      `Investigation under id ${investigationId} was not found.`
    );
  }

  let investigators = await Investigators.findAll({
    where: { investigation_id: investigationId },
  });
  let updates = await InvestigationUpdates.findAll({
    where: { investigation_id: investigationId },
  });

  let updateIds = _.map(updates, (update) => (update.toJSON() as any).id);
  let imagePromises: Promise<any>[] = _.map(updateIds, (id) =>
    getInvestigationUpdate(id)
  );

  let comments = await InvestigationComments.findAll({
    where: { investigation_id: investigationId },
  });
  let object: any = investigation.toJSON();
  object.comments = _.map(comments, (comment) => comment.toJSON());
  object.investigators = _.map(
    investigators,
    (investigator) => investigator.toJSON() as any
  );

  await Promise.all(imagePromises).then((results) => {
    object.updates = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      object.updates.push(result);
    }
  });

  return object;
}

/**
 * Gets an investigation entry, only be the base information. from a report id,
 * provided that the report has an open investigation.
 *
 * @param reportId - The id of a report.
 *
 * @return {object} an object containing the investigation id, report id, created at and
 * updated at date.
 */
export async function getInvestigationIdByReport(reportId: number) {
  let investigation = await Investigations.findOne({
    where: { report_id: reportId, open: true },
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Investigation not found",
      `Investigation on report ${reportId} was not found.`
    );
  }

  return (investigation.toJSON() as any).id;
}

/**
 * Gets an investigation update. An update being a description by an investigator
 * and any attached evidence (images).
 *
 * @param {string} updateId - The id of the update entry.
 *
 * @returns {object} an update object.
 */
export async function getInvestigationUpdate(updateId: any) {
  let update = await InvestigationUpdates.findOne({ where: { id: updateId } });
  if (!update)
    throw new ClientNotFoundError(
      "Client",
      `Update not found`,
      `Investigation update under id ${updateId} was not found.`
    );
  let imageEntries = await InvestigationImages.findAll({
    where: { update_id: updateId },
  });
  let imageIds = _.map(
    imageEntries,
    (entry) => (entry.toJSON() as any).image_id
  );
  let images = await BikeImages.findAll({ where: { id: imageIds } });
  let object: any = update.toJSON();
  object.images = _.map(images, (image) => image.toJSON());
  return object;
}

/**
 * Adds a new investigator to an investigation. The username is
 * used to find the user's entry in the relevant table to get
 * the id of that entry.
 *
 * @param {string} investigationId - The id of an investigation.
 * @param {string} username - The name of the account.
 *
 * @returns {string} the entry of the newly created investigator entry.
 */
export async function addInvestigator(
  investigationId: number,
  username: string
) {
  let investigatorModel = await Users.findOne({ where: { username } });

  if (!investigatorModel) {
    throw new ClientNotFoundError(
      "Client",
      "User not found",
      `User under username ${username} was not found.`
    );
  }

  let investigatorId = (investigatorModel.toJSON() as any).id;

  let investigator = await Investigators.findOne({
    where: {
      investigation_id: investigationId,
      investigator_id: investigatorId,
    },
  });

  if (investigator) {
    throw new ClientNotAcceptableError(
      "Client",
      "User is already an investigator",
      `User under id ${investigatorId} is already an investigator on investigation ${investigationId}.`
    );
  }

  let newInvestigator = await Investigators.create({
    investigation_id: investigationId,
    investigator_id: investigatorId,
  });
  return (newInvestigator.toJSON() as any).id;
}

/**
 * Removes an investigator from an investigation.
 *
 * @param {string} investigationId - The id of an investigation.
 * @param {string} investigatorId - The id of an investigator.
 */
export async function removeInvestigator(
  investigationId: number,
  investigatorId: number
) {
  let investigator = await Investigators.findOne({
    where: {
      id: investigatorId,
      investigation_id: investigationId,
    },
  });

  if (!investigator) {
    throw new ClientNotAcceptableError(
      "Client",
      "Investigator not found",
      `Investigator (User) ${investigatorId} for investigation ${investigationId} was not found.`
    );
  }

  await Investigators.destroy({
    where: {
      id: investigatorId,
      investigation_id: investigationId,
    },
  });
}

/**
 * Creates an investigation comment.
 *
 * @param {string} comment - The comment text.
 * @param {string} authorId  - The id of the author.
 * @param {string} investigationId  - The id of the investigation.
 *
 * @returns {string} id of the newly created comment.
 */
export async function createComment(
  comment: string,
  authorId: number,
  investigationId: number
) {
  let investigation = await Investigations.findOne({
    where: { id: investigationId, open: true },
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Investigation not found",
      `An open investigation under id ${investigationId} was not found.`
    );
  }

  let commentModel = await InvestigationComments.create({
    comment,
    author: authorId,
    investigation_id: investigationId,
  });
  return (commentModel.toJSON() as any).id;
}

/**
 * Removes a comment from an investigation.
 *
 * @param {string} commentId - Comment id.
 */
export async function removeComment(commentId: number) {
  await InvestigationComments.destroy({ where: { id: commentId } });
}

/**
 * Adds an investigation update to the database.
 *
 * @param {string} investigationId - The id of an investigation.
 * @param {string} authorId - The id of the author.
 * @param {string} content - The content of the update.
 *
 * @returns {string} id of the newly created comment.
 */
export async function addUpdate(
  investigationId: number,
  authorId: number,
  content: string
) {
  let investigation = await Investigations.findOne({
    where: { id: investigationId },
  });

  if (!investigation) {
    throw new ClientNotFoundError(
      "Client",
      "Investigation not found",
      `Investigation under id ${investigationId} was not found.`
    );
  }

  let updateModel = await InvestigationUpdates.create({
    investigation_id: investigationId,
    author: authorId,
    content,
  });
  return (updateModel.toJSON() as any).id;
}

/**
 * Changes the visibility of an update from visible (hide = true) to hidden (hide = false)
 *
 * @param {string} updateId - The id of an update.
 *
 */
export async function hideUpdate(updateId: number) {
  await InvestigationUpdates.update(
    { hide: true },
    { where: { id: updateId } }
  );
}

/**
 * Adds evidence to an update via it's update id.
 *
 * @param {string} updateId - The id of an update.
 * @param {string} path - The path of the uploaded picture.
 *
 * @returns {string} the id of the newly created image entry.
 */
export async function addImage(updateId: number, path: string) {
  let bikeImage = await BikeImages.create({ uri: path });

  let imageModel = await InvestigationImages.create({
    update_id: updateId,
    image_id: (bikeImage.toJSON() as any).id,
  });

  return (imageModel.toJSON() as any).id;
}
