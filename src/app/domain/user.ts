import { inject, Injectable } from "@angular/core";
import { Api } from "../data/api";
import { usersDelete, usersGet, usersPost, usersUserCodePut, usersUserCodeUnlockPut } from "../data/functions";
import { CreateUserRequest, UpdateUserRequest, ViewUser } from "../data/models";

@Injectable({
    providedIn: "root",
})
export class UserRepository {
    apiService = inject(Api);

    public async getUsers(): Promise<ViewUser[]> {
        const response = await this.apiService.invoke(usersGet, {})
        return response;
    }

    public async updateUserAsync(data: UpdateUserRequest, userCode: string): Promise<void> {
        await this.apiService.invoke(usersUserCodePut, { body: data, UserCode: userCode });
    }

    public async addUser(data: CreateUserRequest): Promise<void> {
        await this.apiService.invoke(usersPost, { body: data })
    }

    public async deleteUser(userCode: string): Promise<void> {
        await this.apiService.invoke(usersDelete, {
            body: {
                userCode: userCode
            }
        })
    }

    public async lockUnlockUser(userCode: string): Promise<void> {
        await this.apiService.invoke(usersUserCodeUnlockPut, {
            UserCode: userCode
        })
    }
}