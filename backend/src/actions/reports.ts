import { Op } from "sequelize";
import Reports from "../schemas/Reports.schema";
import ReportComments from "../schemas/ReportComments.schema";
import Users from "../schemas/User.schema";

import _ from "lodash";
import {
  ClientNotAcceptableError,
  ClientNotFoundError,
} from "../utils/errorhandler";

/**
 * All actions functions for the report system.
 */

/**
 * Creates a report from the google maps api place id,
 * report description (content) and bike id (id of the bike stolen).
 *
 * @param {number} userId - The id of an account.
 * @param {number} bikeId - The id of a registered bike.
 * @param {string} placeId - The id of a location.
 * @param {string} content - The content of the report.
 *
 * @returns {string} the id of the newly created report.
 */
export async function create(
  userId: number,
  bikeId: number,
  placeId: string,
  content: string
) {
  let reports = await Reports.count({ where: { bike_id: bikeId, open: true } });
  console.log(placeId);
  if (reports > 0) {
    throw new ClientNotAcceptableError(
      "Client",
      "Reports already exists",
      `An open report on bike ${bikeId} already exists.`
    );
  }

  let model = await Reports.create({
    author: userId,
    bike_id: bikeId,
    place_id: placeId,
    content,
  });
  return (model.toJSON() as any).id;
}

/**
 * Options for fetching an array of report ids.
 */
interface ReportOptions {
  author?: number;
  open?: boolean;
  bikeId?: number;
  startDate?: number;
  endDate?: number;
  attributes?: string[];
}

/**
 * Returns a list of report ids. The ids returned varies
 * depending upon what search parameters are present. If
 * no search parameters are injected into this method it
 * will returns all report ids.
 *
 * @param {ReportOptions} opts - A list of search parameters
 *
 * @returns {string[]} an array of report ids.
 */
export async function getReportIds(
  opts: ReportOptions = { attributes: ["id"] }
) {
  let query: { where: any } = { where: {} };

  if (opts.endDate && opts.startDate) {
    query.where.createdAt = {
      [Op.between]: [new Date(opts.startDate), new Date(opts.endDate)],
    };
  } else if (opts.endDate) {
    query.where.createdAt = { [Op.lte]: new Date(opts.endDate) };
  } else if (opts.startDate) {
    query.where.createdAt = { [Op.gte]: new Date(opts.startDate) };
  }

  if (opts.hasOwnProperty("open")) {
    query.where.open = opts.open;
  }

  if (opts.author) {
    if (typeof opts.author === "string") {
      let userModel = await Users.findOne({ where: { username: opts.author } });

      if (userModel === null) {
        return [];
      }

      query.where.author = (userModel.toJSON() as any).id;
    } else {
      query.where.author = opts.author;
    }
  }

  if (opts.bikeId) {
    query.where.bike_id = Number(opts.bikeId);
  }

  let reports = await Reports.findAll(query);
  return _.map(reports, (report) => (report.toJSON() as any).id);
}

/**
 * Returns all information on a report, including images.
 *
 * @param {number} reportId  - The id of a report.
 * @param {number} bikeId - The id of a bike.
 *
 * @returns {object} a report object.
 */
export async function getReport(reportId: number, bikeId: number) {
  let report = null;

  console.log(`ReportId: ${reportId}, BikeId: ${bikeId}`);

  if (reportId !== 0) {
    report = await Reports.findOne({ where: { id: reportId } });
  } else {
    console.log("Using bike id.");
    report = await Reports.findOne({ where: { bike_id: bikeId } });
  }

  console.log(report?.toJSON());

  if (!report) {
    throw new ClientNotFoundError(
      "Client",
      "Report not found",
      `Report under id  ${reportId} does not exist.`
    );
  }

  return report.toJSON();
}

/**
 * The type of comment. Used in storing and fetching comment(s).
 */
export enum CommentType {
  CIVILIAN = "civilian",
  POLICE = "police",
}

/**
 * Adds a report comment to the database.
 *
 * @param {number} reportId - The id of an report
 * @param {string} comment - The comment content.
 * @param {number} author - The author of the comment.
 * @param {CommentType} type - The type of comment.
 *
 * @returns {string} the id of the newly created comment.
 */
export async function createComment(
  reportId: number,
  comment: string,
  author: number,
  type: CommentType
) {
  let report = await Reports.count({ where: { id: reportId } });

  if (report === 0) {
    throw new ClientNotFoundError(
      "Client",
      "Report not found",
      `Report under id ${reportId} does not exist.`
    );
  }

  let commentModel = await ReportComments.create({
    report_id: reportId,
    comment,
    author,
    type,
  });
  return (commentModel.toJSON() as any).id;
}

/**
 * Fetches an array of civilian or police comments.
 *
 * @param {number} reportId - The id of a report.
 * @param {CommentType} type - The type of comments to fetch.
 *
 * @returns {object[]} an array of comments.
 */
export async function getComments(reportId: number, type: CommentType) {
  let comments = await ReportComments.findAll({
    where: { type, report_id: reportId },
  });

  return _.map(comments, (comment) => comment.toJSON());
}

/**
 * Closes a report.
 *
 * @param {number} reportId - The id of a report.
 */
export async function closeReport(reportId: number) {
  let report = await Reports.findOne({
    where: { id: reportId },
    attributes: ["open"],
  });

  if (!report) {
    throw new ClientNotFoundError(
      "Client",
      "Report not found",
      `Report under id ${reportId} was not found.`
    );
  }

  let object: any = report.toJSON();

  if (!object.open) {
    throw new ClientNotAcceptableError(
      "Client",
      "Report already closed",
      `Report under id ${reportId} has already been closed.`
    );
  }

  await Reports.update({ open: false }, { where: { id: reportId } });
}
