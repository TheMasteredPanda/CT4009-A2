import * as databaseManager from "../managers/databaseManager";
import { Op } from "sequelize";
import Reports from "../schemas/Reports.schema";
import ReportComments from "../schemas/ReportComments.schema";
import _ from "lodash";
import {
  ClientNotAcceptableError,
  ClientNotFoundError,
} from "../utils/errorhandler";

export async function create(userId: number, bikeId: number, content: string) {
  let reports = await Reports.count({ where: { bike_id: bikeId, open: true } });

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
    content,
  });
  return (model.toJSON() as any).id;
}

export async function getReportIds(
  opts: {
    author?: number;
    open?: boolean;
    startDate?: number;
    endDate?: number;
    attributes?: string[];
  } = { attributes: ["id"] }
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

  if (opts.open) {
    query.where.open = opts.open;
  }

  if (opts.author) {
    query.where.author = opts.author;
  }

  let reports = await Reports.findAll(query);
  return _.map(reports, (report) => (report.toJSON() as any).id);
}

export async function getReport(reportId: number) {
  let report = await Reports.findOne({ where: { id: reportId } });

  if (!report) {
    throw new ClientNotFoundError(
      "Client",
      "Report not found",
      `Report under id  ${reportId} does not exist.`
    );
  }

  return report.toJSON();
}

export enum CommentType {
  CIVILIAN = "civilian",
  POLICE = "police",
}

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

export async function getComments(reportId: number, type: CommentType) {
  let comments = await ReportComments.findAll({
    where: { type, report_id: reportId },
  });

  return _.map(comments, (comment) => comment.toJSON());
}

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
